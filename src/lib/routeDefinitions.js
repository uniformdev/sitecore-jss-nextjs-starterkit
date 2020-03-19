const routes = require('next-routes');

module.exports = routes()
  .add('/:lang([a-z]{2}-[A-Z]{2})/:sitecoreRoute*', 'index')
  .add('/:lang([a-z]{2})/:sitecoreRoute*', 'index')
  .add('/:sitecoreRoute*', 'index');
