const express = require('express');
const path = require('path');
const fs = require('fs');
const {
  createDisconnectedDictionaryService,
  ManifestManager,
  createDisconnectedLayoutService,
} = require('@sitecore-jss/sitecore-jss-dev-tools');

const config = require('../package.json').config;

const touchToReloadFilePath = path.resolve(path.join(__dirname, '../temp/config.js'));

const disconnectedServerOptions = {
  appRoot: path.join(__dirname, '..'),
  appName: config.appName,
  watchPaths: [path.join(__dirname, '../data')],
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
};

module.exports = {
  attachDisconnectedServices: (server) => {
    disconnectedServerOptions.server = server;
    return createDefaultDisconnectedServer(disconnectedServerOptions);
  },
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
        options.afterMiddlewareRegistered(app);
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
