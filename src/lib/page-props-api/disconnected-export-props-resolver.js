import {
  createDisconnectedLayoutService,
  createDisconnectedDictionaryService,
  ManifestManager,
} from '@sitecore-jss/sitecore-jss-dev-tools';
import { customizeContext, customizeRendering } from '../../server/disconnected-mode-middleware';
import { exportContextProvider } from '../next-export-context-provider';
import getConfig from '../../temp/config';
import { formatRoute } from './utils';

const dataServices = {
  initialized: false,
};

export function getProps(route, language, options) {
  return initializeDataServices().then(() => {
    const { exportRouteDataWriter } = exportContextProvider();

    // Fetch layout data and dictionary data from disconnected services, then write the data to disk.
    return Promise.all([
      fetchLayoutServiceData(route, language, options),
      fetchDictionaryData(language),
    ])
      .then((results) => {
        const props = {
          layoutData: results[0],
          dictionary: results[1],
        };

        if (!props.layoutData || !props.layoutData.sitecore || !props.layoutData.sitecore.route) {
          // If no route data was fetched, then:
          // Pass a statusCode as prop for any interested components.
          props.statusCode = 404;
        }

        return props;
      })
      .then((props) => {
        // Be sure to return props after writing export data
        return exportRouteDataWriter(route, language, props).then(() => props);
      });
  });
}

function initializeDataServices() {
  // If services have already been initialized, return early.
  if (dataServices.initialized) {
    return Promise.resolve();
  }

  const jssConfig = getConfig();

  // Create a ManifestManager instance with minimum configuration required.
  const manifestManager = new ManifestManager({
    appName: jssConfig.jssAppName,
    rootPath: process.cwd(),
  });

  // Set `initialManifest` to false to avoid writing manifest to disk.
  manifestManager.initialManifest = false;

  return manifestManager.getManifest(jssConfig.defaultLanguage).then((manifest) => {
    dataServices.layoutService = createDisconnectedLayoutService({
      manifest,
      manifestLanguageChangeCallback: manifestManager.getManifest,
      customizeContext,
      customizeRendering,
    });

    dataServices.dictionaryService = createDisconnectedDictionaryService({
      manifest,
      manifestLanguageChangeCallback: manifestManager.getManifest,
    });

    dataServices.initialized = true;
  });
}

function fetchLayoutServiceData(route, language, options = {}) {
  const formattedRoute = formatRoute(route);

  // allow devs to override default options with custom options
  const requestOptions = {
    query: {
      sc_lang: language,
      item: formattedRoute,
      ...options.queryStringParams,
    },
    ...options,
  };

  return invokeService(dataServices.layoutService, requestOptions).catch((error) => {
    if (error.response && error.response.status === 404 && error.response.data) {
      return error.response.data;
    }

    console.error(`Route data fetch error for route: ${route}`, error.toJSON());

    return null;
  });
}

function fetchDictionaryData(language, options = {}) {
  // allow devs to override default options with custom options
  const requestOptions = {
    params: {
      language,
    },
    ...options,
  };

  return invokeService(dataServices.dictionaryService, requestOptions).then((response) => {
    return response.phrases;
  });
}

function invokeService(service, requestOptions) {
  // Disconnected Layout Service and disconnected Dictionary Service are both exposed
  // as server middleware. So we can mock the request and response objects that we
  // send to the middleware and make simulated requests for data.

  return new Promise((resolve, reject) => {
    const mockReq = {
      ...requestOptions,
    };

    // Mock the `response` object used by disconnected services.
    // NOTE: may need to add more response methods if the disconnected services implementations ever change.
    const mockRes = {
      sendStatus: (statusCode) => {
        reject(statusCode);
      },
      // note: do not use an arrow function for the `status` function, otherwise `this` will not be bound correctly.
      status(statusCode) {
        return this;
      },
      json: (result) => {
        resolve(result);
      },
    };

    service.middleware(mockReq, mockRes);
  });
}
