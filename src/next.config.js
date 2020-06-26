require('./uniform.config')();

const { serverLogger } = require('./utils/logging/serverLogger');

const withOffline = require('next-offline');
const withGraphQL = require('next-plugin-graphql');
const withPlugins = require('next-compose-plugins');
const withProgressBar = require('next-progressbar');
const withUniform = require('@uniformdev/next-server').config;
const withCSS = require('@zeit/next-css');

const withDynamicRoutes = require('./lib/routing/dynamicRoutesPlugin');
const { routeDefinitions } = require('./lib/routing/routeDefinitions');
const withDisconnectedPathMap = require('./lib/next-plugin-jss-disconnected-path-map');

const plugins = [
  [withCSS],
  [withUniform, { logger: serverLogger }],
  [withDisconnectedPathMap, { jssMode: process.env.JSS_MODE }],
  [withProgressBar],
  [withOffline],
  [withGraphQL],
  // order is important, dynamic routes plugin should occur _after_ any plugin that modifies `exportPathMap`.
  [withDynamicRoutes, { routeDefinitions }],
];

const nextConfig = {
  serverRuntimeConfig: {
    sitecoreApiHost: process.env.UNIFORM_API_URL,
    sitecoreApiKey: process.env.UNIFORM_API_KEY,
    JSS_MODE: process.env.JSS_MODE,
  },
  publicRuntimeConfig: {
    siteName: process.env.UNIFORM_API_SITENAME,
  },
  env: {
    APP_MODE: process.env.APP_MODE || 'static',
  },
  exportTrailingSlash: true,
};

module.exports = withPlugins(plugins, nextConfig);
