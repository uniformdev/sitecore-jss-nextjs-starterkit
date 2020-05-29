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

/*
  CONFIG GENERATION
  Generates the /src/temp/config.js file which contains runtime configuration
  that the app can import and use.
*/

const configOverride = getConfigOverrides();
configGenerator(configOverride);

/*
  COMPONENT FACTORY GENERATION
*/
require('./generate-component-factory');

function getConfigOverrides() {
  const disconnected = process.argv.some((arg) => arg === '--disconnected');
  const isExport = process.argv.some((arg) => arg === '--export');
  const port = uniformServerConfig.PORT || 3000;

  const configOverride = {};
  if (disconnected) {
    configOverride.sitecoreApiHost = `http://localhost:${port}`;
  }

  const siteName = uniformServerConfig.UNIFORM_API_SITENAME;
  if (siteName) {
    configOverride.sitecoreSiteName = siteName;
  }

  if (isExport) {
    const apiKey = uniformServerConfig.UNIFORM_API_KEY;
    if (apiKey) {
      configOverride.apiKey = apiKey;
    }

    const layoutServiceHost = uniformServerConfig.UNIFORM_API_URL;
    if (layoutServiceHost) {
      configOverride.sitecoreApiHost = layoutServiceHost;
    }
  }

  return configOverride;
}
