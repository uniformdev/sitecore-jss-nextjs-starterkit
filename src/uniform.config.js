const dotenv = require('dotenv');

// this file is not required, but it provides default standard values for the starter kit
// it is moved to the separate file because it is used in 2 places: server.ts and next.config.js
// you can override the values in the .env file if required
module.exports = function() {
  dotenv.config();
  process.env.PORT = process.env.PORT || '3000';
  process.env.UNIFORM_API_SITENAME = process.env.UNIFORM_API_SITENAME || 'uniform-jss';
  process.env.UNIFORM_PUBLISH_TARGET = process.env.UNIFORM_PUBLISH_TARGET || 'none';
  process.env.UNIFORM_API_TOKEN = process.env.UNIFORM_API_TOKEN || '1234';
  process.env.UNIFORM_API_DEFAULT_LANGUAGE = process.env.UNIFORM_API_DEFAULT_LANGUAGE || 'en';
};
