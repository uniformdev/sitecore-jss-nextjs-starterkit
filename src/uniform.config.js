const dotenv = require("dotenv");

// this file is not required, but it provides default standard values for the starter kit
// it is moved to the separate file because it is used in 2 places: server.ts and next.config.js
// you can override the values in the .env file if required

const defaults = {
  PORT: 3000,
  UNIFORM_API_SITENAME: "uniform-jsspreview",
  UNIFORM_API_URL: "http://localhost:3000",
  UNIFORM_DATA_URL: "http://localhost:3000",
  UNIFORM_API_DEFAULT_LANGUAGE: "en",
  UNIFORM_OPTIONS_MVC_SUPPORT: false,
  UNIFORM_OPTIONS_MVC_SPA_ENABLED: false,
  UNIFORM_PUBLISH_TARGET: "none",
  UNIFORM_MODE: "preview",
  UNIFORM_API_TOKEN: "1234",
  UNIFORM_PUBLISH_PREFETCH_ENABLED: false,
  UNIFORM_PUBLISH_FAKE_PUBLIC_URL: "http://localhost:3000",
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