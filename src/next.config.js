require('dotenv').config();
const path = require('path');
const { consoleLogger } = require('./utils/logging/consoleLogger');
consoleLogger.info('Loading next.config.js...');

const withOffline = require('next-offline');
const withGraphQL = require('next-plugin-graphql');
const withPlugins = require('next-compose-plugins');
const withProgressBar = require('next-progressbar');
const withUniform = require('@uniformdev/next-server').config;
const withCSS = require('@zeit/next-css');

const plugins = [
  [withCSS],
  [withUniform, { logger: consoleLogger }],
  [withProgressBar],
  [withOffline],
  [withGraphQL],
];

const nextConfig = {
  serverRuntimeConfig: {
    sitecoreApiHost: process.env.UNIFORM_API_URL,
    sitecoreApiKey: process.env.UNIFORM_API_KEY,
  },
  publicRuntimeConfig: {
    siteName: process.env.UNIFORM_API_SITENAME,
  },
  exportTrailingSlash: true,
  // The `custom` property is not technically a valid property on the Next config schema.
  // Fortunately, Next doesn't care or complain if you attach arbitrary properties to the config object.
  custom: {
    // NOTE: for the `exportContextProviderModulePath` value, be sure you're passing a
    // fully resolved path, relative paths will not work.
    exportContextProviderModulePath: path.resolve('./scripts/next-export-context-provider.js'),
  },
};

module.exports = withPlugins(plugins, nextConfig);
