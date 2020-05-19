import { dataApi } from '@sitecore-jss/sitecore-jss-react';
import { dataFetcher } from './dataFetcher';
import getConfig from '../temp/config';
import { isExportProcess } from './helpers';

export function getRouteData(route, language, querystringParams) {
  const config = getConfig();

  let siteName = process.env.UNIFORM_API_SITENAME;
  if (!siteName) {
    siteName = config.sitecoreSiteName;
  }

  const fetchOptions = {
    layoutServiceConfig: { host: config.sitecoreApiHost },
    querystringParams: {
      sc_lang: language,
      sc_apikey: config.sitecoreApiKey,
      sc_site: siteName,
      ...querystringParams,
    },
    fetcher: dataFetcher,
  };

  // Be sure to include `typeof window === 'undefined'` in the following condition so that
  // NextJs won't include the code in client compilation. Otherwise webpack will choke on the
  // inline `require` statement when building for the client.
  if (typeof window === 'undefined' && isExportProcess()) {
    // export mode
    // Fetch layout data from Layout Service, then write the data to disk.

    const { exportContextProvider } = require('./next-export-context-provider');
    const { exportRouteDataWriter } = exportContextProvider();
    let apiData;
    return fetchFromApi(route, fetchOptions)
      .then((data) => {
        apiData = data;
        return exportRouteDataWriter(route, language, data);
      })
      .then(() => apiData);
  } else if (process.env.NODE_ENV === 'production') {
    if (process.env.SITE_RUNTIME_ENV !== 'static') {
      return fetchFromApi(route, fetchOptions);
    }
    // production mode (i.e. the app is "running" somewhere)
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

function fetchFromDisk(route, language) {
  let formattedRoute = formatRoute(route);
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
  const formattedRoute = formatRoute(route);

  return dataApi.fetchRouteData(formattedRoute, fetchOptions).catch((error) => {
    if (error.response && error.response.status === 404 && error.response.data) {
      return error.response.data;
    }

    console.error(`Route data fetch error for route: ${route}`, error.message);

    return null;
  });
}

function formatRoute(route) {
  if (!route) {
    return route;
  }

  // `removeQueryStringFromRoute` shouldn't be necessary, but we have it as a "safety" measure.
  return removeQueryStringFromRoute(ensureLeadingSlash(route));
}

function ensureLeadingSlash(route) {
  const formattedRoute = !route.startsWith('/') ? `/${route}` : route;
  return formattedRoute;
}

function removeQueryStringFromRoute(route) {
  const queryIndex = route.indexOf('?');
  if (queryIndex !== -1) {
    const formattedRoute = route.substring(0, queryIndex);
    return formattedRoute;
  }
  return route;
}
