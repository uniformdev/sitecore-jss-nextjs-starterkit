const nodePath = require('path');
const { ManifestManager } = require('@sitecore-jss/sitecore-jss-dev-tools');
const pkgConfig = require('../package.json').config;

module.exports = (nextConfig) => {
  // we only want to run this plugin in disconnected mode
  if (nextConfig.jssMode !== 'disconnected') {
    return nextConfig;
  }

  nextConfig.exportPathMap = async (defaultPathMap) => {
    try {
      const manifestManager = new ManifestManager({
        appName: pkgConfig.appName,
        rootPath: nodePath.join(__dirname, '..'),
      });

      let manifestPathMap = {};
      function generateManifestPathMap(route, parentPath, params, depth = 0) {
        // first/initial route should resolve to `/` instead of a named route.
        // i.e. we don't want `/home`, we just want `/` for the first/initial route.
        const routeName = depth === 0 ? '' : route.name;
        const routePath = `${urlJoin(parentPath, routeName).toLowerCase()}`;

        manifestPathMap[routePath] = {
          page: '/index',
        };

        // traverse the route tree
        if (route.children) {
          route.children.forEach((child) => {
            generateManifestPathMap(child, routePath, params, (depth += 1));
          });
        }
      }

      // We ultimately want to merge the `defaultPathMap` with our generated path map so
      // that file-system-based routes, i.e. non-dynamic routes / non-manifest routes, can be
      // exported alongside Sitecore routes. However, we need to remove the default `index` and
      // `/` root path because those paths are reserved for dynamic Sitecore routes.
      const { '/index': index, '/': root, ...nonManifestPathMap } = defaultPathMap;

      let resolvedPathMap = {};

      const languages = pkgConfig.appLanguages;
      // If the app has more than one language, we need to generate a path map for each language so
      // we can prefix routes with a language parameter. We also need to modify the nonManifestPathMap
      // routes to add language parameter.
      if (Array.isArray(languages) && languages.length > 1) {
        for (let language of languages) {
          const manifest = await manifestManager.getManifest(language);
          // Prefix manifest routes with language name
          generateManifestPathMap(manifest.items.routes[0], `/${language}`);

          // `nonManifestPathMap` entries will not have a language prefix, so we iterate the paths and
          // add a language prefix where possible.
          for (let [key, value] of Object.entries(nonManifestPathMap)) {
            const pathWithLanguage = `${urlJoin(language, key)}`;
            const manifestPath = manifestPathMap[pathWithLanguage];
            // If the generated path map already contains the constructed `{language}/{path}` key, use it
            // instead of the default/nonManifest path.
            if (manifestPath) {
              continue;
            }

            manifestPathMap[pathWithLanguage] = value;
          }
        }

        resolvedPathMap = manifestPathMap;
      } else {
        const language = pkgConfig.language;
        const manifest = await manifestManager.getManifest(language);
        generateManifestPathMap(manifest.items.routes[0], `/`);

        // Merged the `nonManifestPathMap` with the generated path map.
        // Duplicate path keys will be overwritten by the generated path map.
        resolvedPathMap = {
          ...nonManifestPathMap,
          ...manifestPathMap,
        };
      }

      return resolvedPathMap;
    } catch (error) {
      console.error(error);
      return {};
    }
  };

  return nextConfig;
};

function urlJoin(...parts) {
  // Trim each part to remove slashes (leading or trailing), then join the parts using a slash.
  const joinedParts = parts.map((part) => trim(part, '/')).join('/');
  // Trim any extraneous slashes from the joined parts, then prefix the result with a slash
  // to ensure a leading slash.
  const url = `/${trim(joinedParts, '/')}`;
  return url;
}

function trim(str, char) {
  function getSliceStartIndex(str1) {
    let startCharIndex = -1;
    while (str1.charAt(++startCharIndex) === char);
    return startCharIndex;
  }

  function getSliceEndIndex(str1) {
    let endCharIndex = str1.length;
    while (str1.charAt(--endCharIndex) === char);
    return endCharIndex + 1;
  }
  return str.slice(getSliceStartIndex(str), getSliceEndIndex(str));
}
