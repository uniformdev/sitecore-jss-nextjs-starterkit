export function formatRoute(route) {
  if (!route) {
    return route;
  }

  // `removeQueryStringFromRoute` shouldn't be necessary, but we have it as a "safety" measure.
  return removeQueryStringFromRoute(ensureLeadingSlash(route));
}

export function ensureLeadingSlash(route) {
  const formattedRoute = !route.startsWith('/') ? `/${route}` : route;
  return formattedRoute;
}

export function removeQueryStringFromRoute(route) {
  const queryIndex = route.indexOf('?');
  if (queryIndex !== -1) {
    const formattedRoute = route.substring(0, queryIndex);
    return formattedRoute;
  }
  return route;
}
