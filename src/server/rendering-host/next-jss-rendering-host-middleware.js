const { parse } = require('url');

module.exports = {
  getJssRenderingHostMiddleware,
};

function getJssRenderingHostMiddleware(app, scJssConfig, { serverUrl = '', routeResolver }) {
  return async function middleware(req, res) {
    req.setTimeout(36000, () => {
      console.error('request timed out');
    });

    try {
      const jssData = resolveJssData(req);

      // Server rendering functions expect `GET` requests, but we're handling a `POST` request.
      // so change the incoming request method.
      req.method = 'GET';
      // next.js renderToHtml reads from the req.url property, so set it accordingly
      req.url = jssData.renderPath;

      console.log('Rendering host handling request', req.url);

      // Allows the app to easily determine whether or not it is being rendered via JSS rendering host.
      req.isJssRenderingHostRequest = true;
      // Attach the parsed JSS data as an arbitrary property on the `req` object
      req.jssData = jssData;
      // Attach the JSS config values. This should contain the _remote_ `layoutServiceHost` value, not
      // the generated values from `temp/config.js`. This allows us to override the generated config
      // values at runtime. Otherwise, when the app is served by the Sitecore server, the app will
      // be making layout service/dictionary service requests to the `sitecoreApiHost` value specified in
      // `temp/config.js`. And that value could be, for example, `localhost:3000` if running the app
      // in disconnected mode. That could result in CORS errors and unexpected data. So, we provide
      // the "connected" mode config values so the app can use those when necessary.
      if (scJssConfig) {
        req.jssConfig = {
          sitecoreApiKey: scJssConfig.sitecore.apiKey,
          sitecoreApiHost: scJssConfig.sitecore.layoutServiceHost,
        };
      }

      if (serverUrl) {
        // If a serverUrl has been specified (which it almost always should), then
        // set the asset prefix to be used by the app. Next.js will use this prefix
        // when emitting `<script />` tags for Next scripts and page scripts.
        // For example: `<script src="http://localhost:3000/_next/static/development/pages/index.js">`
        // This will allow the caller (Sitecore) to render the HTML we return and scripts will
        // be served by the Next.js server.
        // NOTE: `setAssetPrefix` does _not_ affect static assets in the `static` folder nor
        // any assets that are `import`-ed within components, nor CSS files. You'll have to use
        // another mechanism to prefix those types of assets with the serverUrl.
        app.setAssetPrefix(serverUrl);

        // To help the "other mechanism" mentioned above, we also attach an arbitrary property
        // to the `req` object that can then be used within `getInitialProps` to provide
        // the Next app with a value that can be used for static asset URLs.
        // NOTE: this is a runtime value, so using it for webpack builds isn't feasible.
        req.assetPrefix = serverUrl;
      }

      // `jssData.renderPath` contains the URL requested via Sitecore
      const parsedUrl = parse(jssData.renderPath, true);
      let routeInfo = {
        pathname: parsedUrl.pathname,
        params: parsedUrl.query,
      };

      // If we have a custom route resolver, then call it with the incoming path and query/param data.
      // The custom route resolver can then handle mapping route path to actual path.
      // This is mostly useful for "dynamic" routes, where a single page (e.g. pages/index.js) is intended
      // to serve routes that aren't statically known by the app. For instance, Sitecore routes that are dynamic.
      // NOTE: `routeResolver` will likely change the value of `routeInfo.pathname` and _should_ merge `routeInfo.params`
      // with any params identified by the route matcher/regex.
      if (routeResolver && typeof routeResolver === 'function') {
        routeInfo = routeResolver(routeInfo);
      }

      // render app and return
      const html = await app.renderToHTML(req, res, routeInfo.pathname, routeInfo.params);

      // need to handle 404 and/or redirect
      res.send({
        html,
        status: 200,
        redirect: '',
      });
    } catch (err) {
      console.error(err);
      res.send({
        html: `<html><body>JSS app rendering error: ${err}</body></html>`,
        status: 500,
        redirect: '',
      });
    }
  };
}

function resolveJssData(req) {
  // We assume req.body has already been parsed as JSON via something like `body-parser` middleware.
  const invocationInfo = req.body;

  // By default, the JSS server invokes this route with the following body data structure:
  // {
  //   id: 'JSS app name',
  //   args: ['route path', 'serialized layout data object', 'serialized viewbag object'],
  //   functionName: 'renderView',
  //   moduleName: 'server.bundle'
  // }

  const result = {
    route: null,
    viewBag: null,
    renderPath: '',
  };

  if (!invocationInfo || !invocationInfo.args || !Array.isArray(invocationInfo.args)) {
    return result;
  }

  result.renderPath = invocationInfo.args[0];

  if (invocationInfo.args.length > 0 && invocationInfo.args[1]) {
    result.route = tryParseJson(invocationInfo.args[1]);
  }

  if (invocationInfo.args.length > 1 && invocationInfo.args[2]) {
    result.viewBag = tryParseJson(invocationInfo.args[2]);
  }

  return result;
}

function tryParseJson(jsonString) {
  try {
    const json = JSON.parse(jsonString);
    // handle non-exception-throwing cases
    if (json && typeof json === 'object' && json !== null) {
      return json;
    }
  } catch (e) {
    console.error(`error parsing json string '${jsonString}'`, e);
  }

  return null;
}
