require('../uniform.config')();
const { parseUniformServerConfig } = require('@uniformdev/common-server');

const configGenerator = require('./generate-config');
const uniformServerConfig = parseUniformServerConfig(process.env, console);

/*
  BOOTSTRAPPING
  The bootstrap process runs before build, and generates JS that needs to be
  included into the build - specifically, the component name to component mapping,
  and the global config module.
*/

const disconnected = process.argv.some((arg) => arg === '--disconnected');

/*
  CONFIG GENERATION
  Generates the /src/temp/config.js file which contains runtime configuration
  that the app can import and use.
*/
const port = uniformServerConfig.PORT || 3000;
const siteName = uniformServerConfig.UNIFORM_API_SITENAME;

let configOverride = disconnected ? { sitecoreApiHost: `http://localhost:${port}` } : {};
configOverride.sitecoreSiteName = siteName;

configGenerator(configOverride);

/*
  COMPONENT FACTORY GENERATION
*/
require('./generate-component-factory');
