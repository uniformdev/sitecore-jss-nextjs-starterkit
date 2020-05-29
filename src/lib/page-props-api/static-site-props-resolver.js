import { getProps as getPropsFromApi } from './fetch-props-resolver';
import { dataFetcher } from './data-fetcher';
import { formatRoute } from './utils';

export function getProps(route, language, options) {
  // Attempt to fetch props data from disk, and fall back to api services if disk fetch returns 404.
  return getPropsFromDisk(route, language).catch((err) => {
    if (err.response && err.response.status === 404) {
      return getPropsFromApi(route, language, options);
    }
    console.error(err);
  });
}

function getPropsFromDisk(route, language) {
  let formattedRoute = formatRoute(route);
  if (formattedRoute === '/') {
    formattedRoute = '/home';
  }

  const filePath = `/data${formattedRoute}/${language}.json`;
  return dataFetcher(filePath).then((response) => {
    // note: `dataFetcher` returns the parsed response, but we're only interested in
    // the `response.data` property.
    return response.data;
  });
}
