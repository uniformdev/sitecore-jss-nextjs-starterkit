const dotenv = require('dotenv');

// this file is not required, but it provides default standard values for the starter kit
// it is moved to the separate file because it is used in 2 places: server.ts and next.config.js
// you can override the values in the .env file if required

const defaults = {
  UNIFORM_JSS_APP_NAME: 'uniform-jss-kit',
  UNIFORM_API_SITENAME: 'uniform-jss-kit',
  UNIFORM_PUBLISH_TARGET: 'fake',
  UNIFORM_MODE: 'mixed'
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
