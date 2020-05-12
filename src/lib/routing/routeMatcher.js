// NOTE: `next` aliases Node `url` with a package named `native-url`, which provides
// the same interface as Node URL but is capable of running in browsers.
// So if you're wondering why we can import a server library in code that will run
// on both client+server, that is why :)
const { parse } = require('url');

module.exports = {
  routeMatcher,
};

function routeMatcher(url, routeDefinitions) {
  // we technically allow empty string values for `url`, so need to explicitly check for undefined or null
  if (typeof url === 'undefined' || url === null) {
    throw new Error('no url provided for route matcher');
  }
  if (!routeDefinitions) {
    throw new Error('no route definitions provided for matching');
  }

  // `url` can be a string or a Node URL object.
  const parsedUrl = typeof url === 'string' ? parse(url, true) : url;
  const { pathname, query } = parsedUrl;

  // default result is the parsedUrl and querystring params
  // todo: should the default result be null/undefined instead?
  const result = {
    params: query,
    parsedUrl,
    route: null,
  };

  for (let i = 0; i < routeDefinitions.length; i++) {
    const routeDefinition = routeDefinitions[i];

    const matchedRoute = routeDefinition.match(pathname);
    if (matchedRoute) {
      // The default result.params contains parsed querystring params. We merge any
      // matched route params with the existing params.
      result.params = result.params ? Object.assign({}, result.params, matchedRoute.params) : matchedRoute.params;
      result.route = routeDefinition;
      break;
    }
  }

  return result;
}
