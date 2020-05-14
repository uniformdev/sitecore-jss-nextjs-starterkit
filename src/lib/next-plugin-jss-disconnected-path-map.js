const axios = require('axios');

module.exports = (nextConfig) => {
  // we only want to run this plugin in disconnected mode
  if (nextConfig.jssMode !== 'disconnected') {
    return nextConfig;
  }

  nextConfig.exportPathMap = async (defaultPathMap) => {
    try {
      // NOTE: `http://localhost:3000` is hard-coded here, but will need to be changed if
      // the disconnected mode server is running at a different URL. Should probably try
      // to resolve this value at runtime if possible.
      const response = await axios.get('http://localhost:3000/disconnected-path-map');
      if (response.status < 200 || response.status > 299) {
        console.error(
          `Received unexpected status from '/disconnected-path-map' URL: ${response.status}`,
          response.data
        );
        return {};
      }

      // We ultimately want to merge the `defaultPathMap` with our generated path map so
      // that file-system-based routes, i.e. non-dynamic routes, can be exported alongside
      // Sitecore routes. However, we need to remove the `index` path because that is
      // the page/page we use for dynamic Sitecore routes.

      const { '/index': index, ...otherPathMap } = defaultPathMap;

      return {
        ...otherPathMap,
        ...response.data,
      };
    } catch (error) {
      console.error(error);
      return {};
    }
  };

  return nextConfig;
};
