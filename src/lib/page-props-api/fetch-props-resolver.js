import { dataApi } from '@sitecore-jss/sitecore-jss-react';
import { dataFetcher } from './data-fetcher';
import { formatRoute } from './utils';
import { fetchDictionaryData } from '../i18n/i18n-manager';
import getConfig from '../../temp/config';

export function getProps(route, language, options = {}) {
  return Promise.all([
    fetchLayoutServiceData(route, language, options),
    fetchDictionaryData(language),
  ]).then((results) => {
    const props = {
      layoutData: results[0],
      dictionary: results[1],
    };

    if (!props.layoutData || !props.layoutData.sitecore || !props.layoutData.sitecore.route) {
      // If no route data was fetched, then pass a 404 statusCode as prop for any interested components.
      props.statusCode = 404;
    }

    return props;
  });
}

function fetchLayoutServiceData(route, language, options = {}) {
  // todo: consider accepting `config` as a fetch option instead of taking a hard dependency
  const config = getConfig();

  // allow devs to override default options with custom options
  const fetchOptions = {
    layoutServiceConfig: {
      host: config.sitecoreApiHost,
      ...options.layoutServiceConfig,
    },
    querystringParams: {
      sc_lang: language,
      sc_apikey: config.sitecoreApiKey,
      sc_site: config.sitecoreSiteName,
      ...options.queryStringParams,
    },
    fetcher: dataFetcher,
    ...options,
  };

  const formattedRoute = formatRoute(route);

  return dataApi.fetchRouteData(formattedRoute, fetchOptions).catch((error) => {
    if (error.response && error.response.status === 404 && error.response.data) {
      return error.response.data;
    }

    console.error(`Route data fetch error for route: ${formattedRoute}`, error.message);

    return null;
  });
}
