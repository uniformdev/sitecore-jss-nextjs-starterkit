// This file doesn't go through babel or webpack transformation.
// Make sure the syntax and sources this file requires are compatible with the current node version you are running
const express = require('express');
const next = require('next');
const bodyParser = require('body-parser');
const cors = require('cors');

const { matchRoute } = require('./lib/routing/routeMatcher');
const { getJssRenderingHostMiddleware } = require('./scripts/next-jss-rendering-host-middleware');
const scJssConfig = require('./scjssconfig.json');

const jssMode = process.env.JSS_MODE || 'disconnected';
const port = process.env.PORT || 3000;
const hostname = process.env.SERVER_HOST_NAME || 'localhost';
const protocol = process.env.SERVER_PROTOCOL || 'http';
const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev });
const defaultRequestHandler = app.getRequestHandler();

const serverUrl = `${protocol}://${hostname}:${port}`;

// OPTIONAL: by default, Next will invoke the `nextConfig.exportPathMap` function
// in development mode. When using the Uniform plugin, this will result in a
// call to the Uniform+Sitecore sitemap endpoint, which _may_ be expensive (for larger sites).
// This call should only happen when the development server is starting up, so
// may not have a big impact on development, but could impact dev server startup time.
// If you want to use the `export` feature in development mode, you can disable the next 3 lines below.
if (dev) {
  app.nextConfig.exportPathMap = undefined;
}

app.prepare().then(() => {
  const server = express();

  server.use(cors());
  server.use(express.static('static'));

  attachJssRenderingHostMiddleware(server, jssMode);

  beforeServerStart(server, jssMode).then(() => {
    server.get('*', (req, res) => {
      if (!req.url.startsWith('/_next/')) {
        // some basic logging without too much noise
        console.log('Incoming HTTP ' + req.method + ' ' + req.url);
      }

      try {
        return defaultRequestHandler(req, res);
      } catch (ex) {
        console.error('Failed to handle request\n' + JSON.stringify(ex));
        return;
      }
    });

    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on ${serverUrl}`);
    });
  });
});

function beforeServerStart(server, mode) {
  return Promise.resolve();
}

function attachJssRenderingHostMiddleware(server, jssMode) {
  const jsonBodyParser = bodyParser.json();

  // Setup the JSS rendering host route.
  // The URL that is called is configured via JSS app config, e.g. `<app serverSideRenderingEngineEndpointUrl="" />`
  // TODO: only add this middleware when starting in `rendering host` / integrated mode
  server.post(
    '/jss-render',
    jsonBodyParser,
    getJssRenderingHostMiddleware(app, scJssConfig, {
      serverUrl,
      routeResolver: (routeInfo) => {
        const { matchedRoute } = matchRoute(routeInfo.pathname);
        if (matchedRoute) {
          return {
            pathname: matchedRoute.path,
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
