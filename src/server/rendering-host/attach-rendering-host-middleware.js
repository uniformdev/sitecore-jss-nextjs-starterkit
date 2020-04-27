const bodyParser = require('body-parser');
const fs = require('fs');
const nodePath = require('path');
const { getJssRenderingHostMiddleware } = require('./next-jss-rendering-host-middleware');
const { matchRoute } = require('../../lib/routing/routeMatcher');

module.exports = {
  attachJssRenderingHostMiddleware,
};

function attachJssRenderingHostMiddleware(server, serverUrl, nextApp, jssMode) {
  // Setup body parsing middleware for incoming POST requests.
  const jsonBodyParser = bodyParser.json({ limit: '2mb' });

  // We can't run rendering host without a JSS config because we need layout service host
  // and api key in order to override generated config in the temp folder.
  // Therefore, if we can't find a `scjssconfig.json` file then we exit.
  const jssConfigPath = nodePath.resolve(__dirname, '../../scjssconfig.json');
  const scJssConfig = fs.existsSync(jssConfigPath)
    ? JSON.parse(fs.readFileSync(jssConfigPath))
    : null;

  if (!scJssConfig) {
    console.warn(
      'scjssconfig.json config file was not detected at the app root, therefore JSS rendering host middleware is disabled.'
    );
    return;
  }

  // Setup the JSS rendering host route.
  // The URL that is called is configured via JSS app config, e.g. `<app serverSideRenderingEngineEndpointUrl="" />`
  server.post(
    '/jss-render',
    jsonBodyParser,
    getJssRenderingHostMiddleware(nextApp, scJssConfig, {
      serverUrl,
      routeResolver: (routeInfo) => {
        const { matchedRoute, matchedDefinition } = matchRoute(routeInfo.pathname);
        if (matchedRoute && matchedDefinition) {
          return {
            pathname: matchedDefinition.destination,
            params: {
              ...routeInfo.params,
              ...matchedRoute.params,
            },
          };
        }
        return routeInfo;
      },
    })
  );
}
