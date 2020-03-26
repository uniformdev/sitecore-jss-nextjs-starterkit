// This file uses CommonJS because it is used by both server and client.
const { match: createMatcher } = require('path-to-regexp');

// `rewrites` are using by `next.config.experimental.rewrites` property and must be an
// array of objects with _only_ `source` and `destination` properties.
const rewrites = [
  {
    source: '/:lang([a-z]{2}-[A-Z]{2})/:sitecoreRoute*',
    destination: '/index',
  },
  {
    source: '/:lang([a-z]{2})/:sitecoreRoute*',
    destination: '/index',
  },
  {
    source: '/:sitecoreRoute*',
    destination: '/index',
  },
];

// We create a new set of definitions mapped from `rewrites` and attach
// a `matcher` property that we can use for easier match evaluation in
// consuming code.
const routeMatcherDefinitions = rewrites.map((rewrite) => {
  return { ...rewrite, matcher: createMatcher(rewrite.source) };
});

// matchRoute iterates `routeMatcherDefinitions` and attempts to match
// and parse the given `path`.
function matchRoute(path) {
  let matchedRoute = null;
  let matchedDefinition = null;

  // Using a `for` loop allows us to break on the first match.
  // Why not `for ... of`? because for...of loops get transpiled to something big and clunky.
  // Why not Array.forEach or Array.reduce? because we can't break early.
  for (let i = 0; i < routeMatcherDefinitions.length; i++) {
    const routeDefinition = routeMatcherDefinitions[i];
    // matcher returns false if no match made
    matchedRoute = routeDefinition.matcher(path);
    if (matchedRoute) {
      matchedDefinition = routeDefinition;
      break;
    }
  }
  return { matchedRoute, matchedDefinition };
}

module.exports = {
  matchRoute,
  rewrites,
  routeMatcherDefinitions,
};
