import React from 'react';
import Router from 'next/router';
import { routeMatcher } from './routeMatcher';

function wrapRouterMethod(method) {
  return (url, as, options) => {
    const { route, params } = Router.matchRoute(url);

    const resolvedHref = route ? route.getHref(params) : href;
    // TODO: review. Is this correct logic for resolving `as`?
    const resolvedAs = as || href;

    return Router[method](resolvedHref, resolvedAs, options);
  };
}

// This concept borrowed from `next-routes` library.
Router.pushRoute = wrapRouterMethod('push');
Router.replaceRoute = wrapRouterMethod('replace');
Router.prefetchRoute = wrapRouterMethod('prefetch');

Router.matchRoute = function matchRoute(url) {
  const matched = routeMatcher(url, Router.routeDefinitions);
  return matched;
};

export const RouterContext = React.createContext(null);

export default ({ children, routeDefinitions }) => {
  Router.routeDefinitions = routeDefinitions;
  return <RouterContext.Provider value={{ router: Router }}>{children}</RouterContext.Provider>;
};
