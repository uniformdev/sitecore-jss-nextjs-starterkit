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

const plugins = [
  [withCSS],
  [withUniform, { logger: serverLogger }],
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
  },
  publicRuntimeConfig: {
    siteName: process.env.UNIFORM_API_SITENAME,
  },
  env: {
    SITE_RUNTIME_ENV: process.env.SITE_RUNTIME_ENV || 'static',
  },
  exportTrailingSlash: true,
};

module.exports = withPlugins(plugins, nextConfig);
