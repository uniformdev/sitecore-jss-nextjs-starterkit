// Use this file to declare dynamic route patterns for your app.
// Patterns are compiled and evaluated by `path-to-regexp`.

const { createRouteDefinition } = require('./route');

module.exports = {
  routeDefinitions: [
    createRouteDefinition({
      pattern: '/:lang([a-z]{2}-[A-Z]{2})/:sitecoreRoute*',
      page: '/index',
    }),
    createRouteDefinition({
      pattern: '/:lang([a-z]{2})/:sitecoreRoute*',
      page: '/index',
    }),
    createRouteDefinition({
      pattern: '/:sitecoreRoute*',
      page: '/index',
    }),
  ],
};
