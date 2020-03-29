const _config = require('./_defaultConfig');
_config();

require('dotenv').config();

const { consoleLogger } = require('./utils/logging/consoleLogger');
consoleLogger.info('Loading next.config.js...');

const withOffline = require('next-offline');
const withGraphQL = require('next-plugin-graphql');
const withPlugins = require('next-compose-plugins');
const withProgressBar = require('next-progressbar');
const withUniform = require('@uniformdev/next-server').config;
const withCSS = require('@zeit/next-css');

const { rewrites } = require('./lib/routing/routeMatcher');
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
  experimental: {
    rewrites: () => rewrites,
  },
};

module.exports = withPlugins(plugins, nextConfig);
