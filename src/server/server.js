// This file doesn't go through babel or webpack transformation.
// Make sure the syntax and sources this file requires are compatible with the current node version you are running
require('../uniform.config')();
const express = require('express');
const next = require('next');

const cors = require('cors');
const nodePath = require('path');
const {
  attachUniformServicesToServer,
  parseUniformServerConfig,
} = require('@uniformdev/common-server');
const { NextBuildAndExportEngine } = require('@uniformdev/next-server');
const { createPublishProvider } = require('@uniformdev/publishing-all');

const { getDynamicRequestHandler } = require('../lib/routing/dynamicRequestHandler');
const { routeDefinitions } = require('../lib/routing/routeDefinitions');

const {
  attachJssRenderingHostMiddleware,
} = require('../server/rendering-host/attach-rendering-host-middleware');
const { attachDisconnectedServices } = require('../server/disconnected-mode-middleware');
const { serverLogger } = require('../utils/logging/serverLogger');

const jssMode = process.env.JSS_MODE || 'disconnected';
const port = process.env.PORT || 3000;
const hostname = process.env.SERVER_HOST_NAME || 'localhost';
const protocol = process.env.SERVER_PROTOCOL || 'http';
const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev });
const defaultRequestHandler = app.getRequestHandler();
const dynamicRequestHandler = getDynamicRequestHandler(app, routeDefinitions);

const serverUrl = `${protocol}://${hostname}:${port}`;

if (dev) {
  // OPTIONAL: by default, Next will invoke the `nextConfig.exportPathMap` function
  // in development mode. When using the Uniform plugin, this will result in a
  // call to the Uniform+Sitecore sitemap endpoint, which _may_ be expensive (for larger sites).
  // This call should only happen when the development server is starting up, so
  // may not have a big impact on development, but could impact dev server startup time.
  // If you want to use the `export` feature in development mode, you can remove or comment out the next line.
  app.nextConfig.exportPathMap = undefined;
}

app.prepare().then(() => {
  const server = express();

  server.use(cors());
  server.use(express.static('public'));

  attachJssRenderingHostMiddleware(server, serverUrl, app, jssMode);

  beforeServerStart(server, jssMode).then(() => {
    // Serve service-worker.js file when requested.
    server.get('/service-worker.js', (req, res) => {
      res.sendFile(nodePath.join(__dirname, '../.next', 'service-worker.js'));
    });

    server.get('*', (req, res) => {
      if (
        req.url.startsWith('/_next/') ||
        req.url.startsWith('/sw.js') ||
        req.url.startsWith('/favicon.ico')
      ) {
        return defaultRequestHandler(req, res);
      }

      // some basic logging without too much noise
      console.log('Incoming HTTP ' + req.method + ' ' + req.url);

      try {
        return dynamicRequestHandler(req, res);
      } catch (ex) {
        console.error('Failed to handle request\n' + ex);
        return;
      }
    });

    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on ${serverUrl}`);
    });
  });
});

async function beforeServerStart(server, mode) {
  if (mode === 'disconnected') {
    await attachDisconnectedServices(server);
  }
  attachUniformServices(server);
  return Promise.resolve();
}

// Setup Uniform config and attach Uniform-specific middleware to the existing server.
function attachUniformServices(server) {
  const uniformServerConfig = parseUniformServerConfig(process.env, serverLogger);
  const buildAndExportEngine = new NextBuildAndExportEngine(uniformServerConfig);

  const options = {
    uniformServerConfig,
    createPublishProvider: (config) => createPublishProvider(config),
  };

  attachUniformServicesToServer(server, buildAndExportEngine, serverLogger, options);
}
