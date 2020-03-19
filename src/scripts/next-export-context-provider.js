/*
  During Next export, we need to export Layout Service data to static JSON files that are emitted to the
  same output directory as the static site export artifacts.

  The easiest place to do this is within the `getRouteData` function used in the
  `src/lib/layoutServiceUtils.js` file. However, the code in that file is intended to
  be universal, i.e. it runs on client and server. That means we can't import/require file-system modules (like Node `fs`)
  into that file without breaking the client build.

  Ideally, we could invoke a custom module/function within that file that would only execute during
  export time. However, Next doesn't expose any hooks into the export process to allow us to do that.
  Furthermore, the Next export process uses `jest-worker` module to parallelize the export process across
  multiple child processes. This complicates things because we can't attach arbitrary properties to
  the Node `global` object within code that we manage because the workers/child processes each have 
  their own `global` object.

  So, we have to "patch" the Next export process to allow us to pass in the path to a module that should
  be loaded by each worker/child process. That would be the file/module you're currently looking at.

  The `exportContextProvider` method will be called from each worker and will receive the export `outDir` parameter.
  The object that is return from the `exportContextProvider` method is then set as the 
  `__NEXT_EXPORT_CONTEXT__` property on the `global` object, e.g. `global.__NEXT_EXPORT_CONTEXT__`

  This global object can then be used in your code to execute custom export code, 
  i.e. what you see in `layoutServiceUtils.js`.
*/

const fs = require('fs');

function exportContextProvider({ outDir }) {
  return {
    exportDataWriter,
    exportOutDir: outDir,
  };
}

function exportDataWriter(routeName, language, data) {
  // Next export workers/child processes set `__NEXT_DATA__.nextExport = true` when exporting.
  // We can use that along with a check for our custom export context to ensure our
  // code is only being called when intended.
  if (!global.__NEXT_DATA__.nextExport || !global.__NEXT_EXPORT_CONTEXT__.exportOutDir) {
    return Promise.resolve();
  }

  let fileName = routeName === '/' ? 'home' : routeName;
  if (fileName.startsWith('/')) {
    fileName = fileName.substring(1);
  }

  // NOTE: routeName may contain nested paths, e.g. /boutiques-restaurants/agatha
  // Need to ensure that we create the folder structure to match.
  const dataFolder = `${global.__NEXT_EXPORT_CONTEXT__.exportOutDir}/data/${fileName}`;
  const filePath = `${dataFolder}/${language}.json`;

  return ensureDirectoryExists(dataFolder).then(() => {
    return writeFile(filePath, data);
  });
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

module.exports = {
  exportContextProvider,
};
