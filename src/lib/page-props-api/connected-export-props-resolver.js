import { getProps as getPropsFromApi } from './fetch-props-resolver';
import { exportContextProvider } from '../next-export-context-provider';

export function getProps(route, language, options = {}) {
  // Fetch props data from api services, then write the data to disk.
  const { exportRouteDataWriter } = exportContextProvider();
  let apiData;
  return getPropsFromApi(route, language, options)
    .then((data) => {
      apiData = data;
      return exportRouteDataWriter(route, language, data);
    })
    .then(() => apiData);
}
