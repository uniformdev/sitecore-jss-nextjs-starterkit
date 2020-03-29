/*
During Next export, we need to export Layout Service data to static JSON files that are emitted to the
same output directory as the static site export artifacts.

The easiest place to do this is within the `getRouteData` function used in the
`src/lib/layoutServiceUtils.js` file. However, we don't want to pollute that file with a bunch of
export-specific code, so use this module to provide any export-specific functionality.
*/

const fs = require('fs');
const nodePath = require('path');
const { isExportProcess } = require('./helpers');

module.exports = {
  exportContextProvider,
};

function exportContextProvider() {
  const exportOutDir = resolveExportOutDir();

  function exportRouteDataWriter(routePath, language, data) {
    if (!isExportProcess()) {
      return Promise.resolve();
    }

    let routeName = routePath === '/' ? 'home' : routePath;
    if (routeName.startsWith('/')) {
      routeName = routeName.substring(1);
    }

    // NOTE: routeName may contain nested paths, e.g. /news-events/press-releases/release-01
    // Need to ensure that we create the folder structure to match.
    const dataFolder = `${exportOutDir}/data/${routeName}`;
    const filePath = `${dataFolder}/${language}.json`;

    return ensureDirectoryExists(dataFolder).then(() => {
      return writeFile(filePath, data);
    });
  }

  return {
    exportRouteDataWriter,
    exportOutDir,
  };
}

function resolveExportOutDir() {
  // Unfortunately there isn't a way to obtain the `outDir` value that NextJs uses for exporting at runtime.
  // So, we ask that if devs use a custom `--outdir` flag for `next export` that they also set an environment
  // variable that we can use when writing export data.
  // Next.js export defaults to the `/out` folder in the src root, so we use that as our default as well.
  const exportOutDir = process.env.EXPORT_OUT_DIR || nodePath.resolve(process.cwd(), 'out');
  return exportOutDir;
}

function writeFile(filePath, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), { encoding: 'utf-8' }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function ensureDirectoryExists(dirPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dirPath)) {
      resolve();
      return;
    }

    // The `recursive` option ensures that nested paths are fully created.
    // For example, `/out/data/boutiques-restaurants/agatha` would create
    // the following folder structure:
    // out
    //   data
    //     boutiques-restaurants
    //       agatha
    fs.mkdir(dirPath, { recursive: true }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
