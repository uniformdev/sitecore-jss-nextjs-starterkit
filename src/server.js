// This file doesn't go through babel or webpack transformation.
// Make sure the syntax and sources this file requires are compatible with the current node version you are running
const express = require('express');
const next = require('next');
const bodyParser = require('body-parser');
const cors = require('cors');

const routes = require('./lib/routeDefinitions');
const { getJssRenderingHostMiddleware } = require('./scripts/next-jss-rendering-host-middleware');
const scJssConfig = require('./scjssconfig.json');

const jssMode = process.env.JSS_MODE || 'disconnected';
const port = process.env.PORT || 3000;
const hostname = process.env.SERVER_HOST_NAME || 'localhost';
const protocol = process.env.SERVER_PROTOCOL || 'http';
const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev });
const defaultRequestHandler = app.getRequestHandler();
const dynamicRouteHandler = routes.getRequestHandler(app);
const jsonBodyParser = bodyParser.json();

const serverUrl = `${protocol}://${hostname}:${port}`;

app.prepare().then(() => {
  const server = express();

  server.use(cors());
  server.use(express.static('static'));

  // Setup the JSS rendering host route.
  // The URL that is called is configured via JSS app config, e.g. `<app serverSideRenderingEngineEndpointUrl="" />`
  // TODO: only add this middleware when starting in `rendering host` / integrated mode
  server.post(
    '/jss-render',
    jsonBodyParser,
    getJssRenderingHostMiddleware(app, scJssConfig, {
      serverUrl,
      routeResolver: (routeInfo) => {
        const { route, query } = routes.match(routeInfo.pathname);
        if (route) {
          return {
            pathname: route.page,
            params: {
              ...routeInfo.params,
              ...query,
            },
          };
        }
        return routeInfo;
      },
    })
  );

  // Setup JSS disconnected mode support.
  // TODO: only attach this when starting in `disconnected` mode. In any other mode, we don't
  // need to the disconnected layout service, dictionary service, media service.
  beforeServerStart(server, jssMode).then(() => {
    server.get('*', (req, res) => {
      const path = decodeURI(req.path) || '/';
      if (path.startsWith('/_next/')) {
        return defaultRequestHandler(req, res);
      }

      if (!/\/$|\.\w+$/g.exec(path)) {
        // redirect if /foo and not /foo.png
        res.redirect(req.path + '/', 302);
        return;
      }

      console.log('Incoming HTTP ' + req.method + ' ' + path);

      try {
        return dynamicRouteHandler(req, res);
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
