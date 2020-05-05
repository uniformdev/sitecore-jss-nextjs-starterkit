const { routeMatcher } = require('./routeMatcher');

module.exports = (nextConfig) => {
  if (typeof nextConfig.exportPathMap !== 'function') {
    return nextConfig;
  }

  if (!nextConfig.routeDefinitions || !Array.isArray(nextConfig.routeDefinitions)) {
    console.warn(
      'The `dynamicRoutesPlugin` was added without any route definitions provided. Please ensure that you are adding a `routeDefinitions` array as a plugin parameter.'
    );
    return nextConfig;
  }

  const originalExportPathMap = nextConfig.exportPathMap;

  nextConfig.exportPathMap = async (defaultPathMap, exportContext) => {
    const pathMap = await originalExportPathMap(defaultPathMap, exportContext);

    const newPathMap = Object.keys(pathMap).reduce((result, pathMapKey) => {
      const { route, params } = routeMatcher(pathMapKey, nextConfig.routeDefinitions);
      result[pathMapKey] = {
        ...pathMap[pathMapKey],
        page: route.page,
        query: {
          ...pathMap[pathMapKey.query],
          ...params,
        },
      };
      return result;
    }, {});

    return newPathMap;
  };

  return nextConfig;
};
