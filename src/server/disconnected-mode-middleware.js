const express = require('express');
const path = require('path');
const fs = require('fs');
const {
  createDisconnectedDictionaryService,
  ManifestManager,
  createDisconnectedLayoutService,
} = require('@sitecore-jss/sitecore-jss-dev-tools');
const jsYaml = require('js-yaml');

const config = require('../package.json').config;

const touchToReloadFilePath = path.resolve(path.join(__dirname, '../temp/config.js'));
const dataPath = path.join(__dirname, '../data');

const disconnectedServerOptions = {
  appRoot: path.join(__dirname, '..'),
  appName: config.appName,
  watchPaths: [dataPath],
  language: config.language,
  onManifestUpdated: (manifest) => {
    // if we can resolve the config file, we can alter it to force reloading the app automatically
    // instead of waiting for a manual reload. We must materially alter the _contents_ of the file to trigger
    // an actual reload, so we append "// reloadnow" to the file each time. This will not cause a problem,
    // since every build regenerates the config file from scratch and it's ignored from source control.
    if (fs.existsSync(touchToReloadFilePath)) {
      const currentFileContents = fs.readFileSync(touchToReloadFilePath, 'utf8');
      const newFileContents = `${currentFileContents}\n// reloadnow`;
      fs.writeFileSync(touchToReloadFilePath, newFileContents, 'utf8');

      console.log('Manifest data updated. Reloading the browser.');
    } else {
      console.log('Manifest data updated. Refresh the browser to see latest content!');
    }
  },
  customizeContext,
  customizeRendering,
};

module.exports = {
  attachDisconnectedServices: (server) => {
    disconnectedServerOptions.server = server;
    return createDefaultDisconnectedServer(disconnectedServerOptions);
  },
  customizeContext,
  customizeRendering,
};

function createDefaultDisconnectedServer(options) {
  const server = options.server;

  // backwards compatibility with fix for #80
  // for GA the appRoot was expected to be $app/scripts
  // which didn't make sense. This allows both sane app roots
  // and GA-style app roots to keep working.
  if (options.appRoot.endsWith('scripts')) {
    options.appRoot = path.join(options.appRoot, '..');
  }

  // further backwards compatibility for #80
  // allows apps with GA watch path of '../data' (relative to /scripts)
  // to keep working even with appRoot now relative to the actual app root
  // We do this by stripping '../' from path leads, making the path './data' instead - theoretically, the chance of
  // wanting to actually escape from the app root entirely otherwise is awfully low.
  options.watchPaths = options.watchPaths.map((path) =>
    path.startsWith('../') ? path.substring(1) : path
  );

  // the manifest manager maintains the state of the disconnected manifest data during the course of the dev run
  // it provides file watching services, and language switching capabilities
  const manifestManager = new ManifestManager({
    appName: options.appName,
    rootPath: options.appRoot,
    watchOnlySourceFiles: options.watchPaths,
    requireArg: options.requireArg,
    sourceFiles: options.sourceFiles,
  });

  return manifestManager
    .getManifest(options.language)
    .then((manifest) => {
      // creates a fake version of the Sitecore Layout Service that is powered by your disconnected manifest file
      const layoutService = createDisconnectedLayoutService({
        manifest,
        manifestLanguageChangeCallback: manifestManager.getManifest,
        customizeContext: options.customizeContext,
        customizeRoute: options.customizeRoute,
        customizeRendering: options.customizeRendering,
      });

      // creates a fake version of the Sitecore Dictionary Service that is powered by your disconnected manifest file
      const dictionaryService = createDisconnectedDictionaryService({
        manifest,
        manifestLanguageChangeCallback: manifestManager.getManifest,
      });

      // set up live reloading of the manifest when any manifest source file is changed
      manifestManager.setManifestUpdatedCallback((newManifest) => {
        layoutService.updateManifest(newManifest);
        dictionaryService.updateManifest(newManifest);
        if (options.onManifestUpdated) {
          options.onManifestUpdated(newManifest);
        }
      });

      // attach our disconnected service mocking middleware to webpack dev server
      server.use('/assets', express.static(path.join(options.appRoot, 'assets')));
      server.use('/data/media', express.static(path.join(options.appRoot, 'data/media')));
      server.use('/sitecore/api/layout/render', layoutService.middleware);
      server.use('/sitecore/api/jss/dictionary/:appName/:language', dictionaryService.middleware);

      if (options.afterMiddlewareRegistered) {
        options.afterMiddlewareRegistered(server);
      }
    })
    .catch((error) => {
      if (options.onError) {
        options.onError(error);
      } else {
        console.error(error);
        process.exit(1);
      }
    });
}

function customizeContext(context, routeData, currentManifest, request, response) {
  const routePath = request.query.item;
  const language = request.query.sc_lang;
  const filenames = [`${language}.json`, `${language}.yml`];
  const filepaths = filenames.map((filename) =>
    path.join(dataPath, 'context', routePath, filename)
  );

  // Attempt to find a matching `{language}.json` or `{language}.yml` file in `/data/context/{routePath}`
  // If no file is found, return default context;
  const contextFilePath = filepaths.find((filepath) => fs.existsSync(filepath));
  if (!contextFilePath) {
    return context;
  }

  const contextFileContents = fs.readFileSync(contextFilePath);
  const parsedFileContents = tryParseJsonOrYaml(contextFileContents);
  // If we can't parse the file contents, bail.
  if (!parsedFileContents) {
    return context;
  }

  // Merge custom context data with default context data.
  return {
    ...context,
    ...parsedFileContents,
  };
}

function customizeRendering(transformedRendering, rendering, currentManifest, request, response) {
  // If a rendering has a `dataSource` value (which should be a guid), then use that value for the
  // transformed rendering `dataSource` value instead of the default `available-in-connected-mode` value.
  // This is primarily to accommodate personalization testing in disconnected mode with _actual_
  // Layout Service data that was captured from Sitecore but is being used in disconnected mode.
  if (rendering.dataSource.dataSource) {
    transformedRendering.dataSource = rendering.dataSource.dataSource;
  }
  return transformedRendering;
}

function tryParseJsonOrYaml(jsonString) {
  try {
    var json = jsYaml.safeLoad(jsonString);
    // handle non-exception-throwing cases
    if (json && typeof json === 'object' && json !== null) {
      return json;
    }
  } catch (e) {
    console.error(e);
  }
  return false;
}
