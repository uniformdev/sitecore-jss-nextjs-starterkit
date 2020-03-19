import { dataApi } from '@sitecore-jss/sitecore-jss-react';
import { dataFetcher } from './dataFetcher';
import getConfig from '../temp/config';

export function getRouteData(route, language) {
  const config = getConfig();
  const fetchOptions = {
    layoutServiceConfig: { host: config.sitecoreApiHost },
    querystringParams: {
      sc_lang: language,
      sc_apikey: config.sitecoreApiKey,
      sc_site: config.jssAppName,
    },
    fetcher: dataFetcher,
  };

  // `global` is typically defined in browsers, so we also need to check for the existence
  // of the `__NEXT_DATA__` and `__NEXT_EXPORT_CONTEXT__` properties to fully ensure
  // that the code is currently being executed as part of static export process.
  if (
    typeof global !== 'undefined' &&
    global.__NEXT_DATA__ &&
    global.__NEXT_DATA__.nextExport &&
    global.__NEXT_EXPORT_CONTEXT__
  ) {
    // export mode
    // Fetch layout data from Layout Service, then write the data to disk.
    const exportDataWriter = global.__NEXT_EXPORT_CONTEXT__.exportDataWriter;

    let apiData;
    return fetchFromApi(route, fetchOptions)
      .then((data) => {
        apiData = data;
        return exportDataWriter(route, language, data);
      })
      .then(() => apiData);
  } else if (process.env.NODE_ENV === 'production') {
    // production mode
    // Attempt to fetch layout data from disk, and fall back to Layout Service if disk fetch returns 404.
    return fetchFromDisk(route, language).catch((err) => {
      if (err.response && err.response.status === 404) {
        return fetchFromApi(route, fetchOptions);
      }
      console.error(err);
    });
  } else {
    // development mode
    // Fetch layout data from Layout Service
    return fetchFromApi(route, fetchOptions);
  }
}

function ensureLeadingSlash(route) {
  const formattedRoute = !route.startsWith('/') ? `/${route}` : route;
  return formattedRoute;
}

function fetchFromDisk(route, language) {
  let formattedRoute = ensureLeadingSlash(route);
  if (formattedRoute === '/') {
    formattedRoute = '/home';
  }

  const filePath = `/data${formattedRoute}/${language}.json`;
  return dataFetcher(filePath).then((response) => {
    // note: `dataFetcher` returns the parsed response, but we're only interested in
    // the `data` property, which is what is returned by the `dataApi.fetchRouteData` function.
    return response.data;
  });
}

function fetchFromApi(route, fetchOptions) {
  const formattedRoute = ensureLeadingSlash(route);

  return dataApi.fetchRouteData(formattedRoute, fetchOptions).catch((error) => {
    if (error.response && error.response.status === 404 && error.response.data) {
      return error.response.data;
    }

    console.error(`Route data fetch error for route: ${route}`, error.message);

    return null;
  });
}
