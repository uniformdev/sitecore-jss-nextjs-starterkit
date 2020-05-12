import { routeMatcher } from './routeMatcher';

export function enhanceRouter(nextRouter, routeDefinitions) {
  nextRouter.routeDefinitions = routeDefinitions;

  function wrapRouterMethod(method) {
    return (url, as, options) => {
      const { route, params } = nextRouter.matchRoute(url);

      const resolvedHref = route ? route.getHref(params) : href;
      const resolvedAs = as || href;

      return nextRouter[method](resolvedHref, resolvedAs, options);
    };
  }

  // This concept borrowed from `next-routes` library.
  nextRouter.pushRoute = wrapRouterMethod('push');
  nextRouter.replaceRoute = wrapRouterMethod('replace');
  nextRouter.prefetchRoute = wrapRouterMethod('prefetch');

  nextRouter.matchRoute = (url) => {
    const matched = routeMatcher(url, nextRouter.routeDefinitions);
    return matched;
  };

  return nextRouter;
}
