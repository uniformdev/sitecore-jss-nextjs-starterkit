const { routeMatcher } = require('./routeMatcher');

module.exports = { getDynamicRequestHandler };

function getDynamicRequestHandler(app, routeDefinitions, { customHandler } = {}) {
  const nextHandler = app.getRequestHandler();

  return (req, res) => {
    const { route, params, parsedUrl } = routeMatcher(req.url, routeDefinitions);

    if (route) {
      if (customHandler) {
        customHandler({ req, res, route, params });
      } else {
        app.render(req, res, route.page, params);
      }
    } else {
      nextHandler(req, res, parsedUrl);
    }
  };
}
