const _config = require('./uniform.config');
_config();

require('dotenv').config();

const { serverLogger } = require('./utils/logging/serverLogger');

const withOffline = require('next-offline');
const withGraphQL = require('next-plugin-graphql');
const withPlugins = require('next-compose-plugins');
const withProgressBar = require('next-progressbar');
const withUniform = require('@uniformdev/next-server').config;
const withCSS = require('@zeit/next-css');

const { rewrites } = require('./lib/routing/routeMatcher');
const plugins = [
  [withCSS],
  [withUniform, { logger: serverLogger }],
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
  env: {
    SITE_RUNTIME_ENV: process.env.SITE_RUNTIME_ENV || 'static',
  },
  exportTrailingSlash: true,
  experimental: {
    rewrites: () => rewrites,
  },
};

module.exports = withPlugins(plugins, nextConfig);
