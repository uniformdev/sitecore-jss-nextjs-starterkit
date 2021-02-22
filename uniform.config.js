const dotenv = require('dotenv');

// this file is not required, but it provides default standard values for the starter kit
// it is moved to the separate file because it is used in 2 places: server.ts and next.config.js
// you can override the values in the .env file if required

const defaults = {
  UNIFORM_API_SITENAME: 'uniform-jss-kit',
  UNIFORM_PUBLISH_TARGET: 'none',
  UNIFORM_MODE: 'mixed',
  UNIFORM_PUBLISH_FAKE_PUBLIC_URL: 'http://localhost',
  UNIFORM_API_KEY: 'eefe326b-aff1-4154-9ae8-2beb85d4b8cb',
};

function processDefault(key, fallback) {
  if (!key) {
    return null;
  }
  process.env[key] = process.env[key] || fallback;
}

module.exports = function () {
  dotenv.config();
  Object.keys(defaults).forEach((k) => processDefault(k, defaults[k]));
};
