import getConfig from '../../temp/config';
import { isExportProcess } from '../helpers';
import { getProps as getPropsStatic } from './static-site-props-resolver';
import { getProps as getPropsFromApi } from './fetch-props-resolver';
import { getCurrentLanguage } from '../i18n/i18n-manager';

export function pagePropsFactory({ req, query }) {
  const jssConfig = getConfig();

  const { resolvedRoute, resolvedLanguage, queryStringParams } = resolveParams(query, jssConfig);

  const defaultProps = {
    layoutData: null,
    statusCode: 200,
    dictionary: null,
    language: resolvedLanguage,
    assetPrefix: '',
    jssConfig,
  };

  // If an `assetPrefix` property is attached to the `req` object, then pass it
  // in as a prop. This approach will usually only be used when the app is being rendered
  // via JSS rendering host, but may be useful in other situations as well.
  if (typeof window === 'undefined' && req && req.assetPrefix) {
    defaultProps.assetPrefix = req.assetPrefix;
  }

  // ========== RENDERING HOST ===========
  // For JSS Integrated Mode the app uses JSS rendering host for rendering, which
  // will set the `isJssRenderingHostRequest` value.
  // Note: we use `typeof window` condition here so that Next will remove this code from the client build.
  // Otherwise, webpack will fail on the `require` statement.
  if (typeof window === 'undefined' && req && req.isJssRenderingHostRequest) {
    const { getProps } = require('./jss-rendering-host-props-resolver');

    // Early return/exit here because the `getProps` signature of the rendering host props resolver is different
    // than the `getProps` signature of all the other modes.
    return getProps(req).then((props) => {
      const resolvedProps = mergeProps(props, defaultProps);
      return resolvedProps;
    });
  }

  let getPropsPromise;

  // =========== EXPORT ==============
  // Note: we use `typeof window` condition here so that Next will remove this code from the client build.
  // Otherwise, webpack will fail on the `require` statement.
  if (typeof window === 'undefined' && isExportProcess()) {
    // Export mode. The app is being rendered for static export.

    // The export process may run in multiple threads/workers, and each worker will have
    // a distinct `process` which does not have the same env vars as the original process.
    // Therefore, we need to use next config to retrieve env vars that have been defined in next.config.js.
    const nextConfig = require('next/config').default;

    // If in disconnected mode, we need to handle data retrieval for static export differently than in connected mode.
    if (nextConfig().serverRuntimeConfig.JSS_MODE === 'disconnected') {
      const { getProps } = require('./disconnected-export-props-resolver');
      getPropsPromise = getProps;
    } else {
      const { getProps } = require('./connected-export-props-resolver');
      getPropsPromise = getProps;
    }
  }

  // =========== RUNTIME =============
  else if (process.env.NODE_ENV === 'production') {
    // Non-Export Production mode, i.e. the app is "running" somewhere but not within a static export process.

    // If not running as a static site, i.e. deployed to a CDN / static site host, then assume
    // we need to fetch from a "standard" Layout Service endpoint (either disconnected or connected).
    if (process.env.APP_MODE !== 'static') {
      getPropsPromise = getPropsFromApi;
    } else {
      // Otherwise, try to fetch from static data.
      getPropsPromise = getPropsStatic;
    }
  } else {
    // Development mode
    // Fetch layout data from a "standard" Layout Service endpoint (either disconnected or connected).
    getPropsPromise = getPropsFromApi;
  }

  return getPropsPromise(resolvedRoute, resolvedLanguage, {
    queryStringParams,
  }).then((props) => {
    const resolvedProps = mergeProps(props, defaultProps);
    return resolvedProps;
  });
}

function resolveParams(routeParams, jssConfig) {
  const { sitecoreRoute, lang, ...queryStringParams } = routeParams;

  // `sitecoreRoute` param may be undefined when the current URL is `/` or
  // when the current URL is just a language parameter, e.g. `/en`, `/nl-NL`
  // In those scenarios, we default to `/` for the route.
  const resolvedRoute = sitecoreRoute || '/';

  // determine language by route first, then by "state" (i18n.language), else fallback to default config
  const resolvedLanguage = lang || getCurrentLanguage() || jssConfig.defaultLanguage;

  return {
    resolvedRoute,
    resolvedLanguage,
    queryStringParams,
  };
}

function mergeProps(props, defaultProps) {
  const mergedProps = {
    ...defaultProps,
    ...props,
  };

  // If props contains a jssConfig object, we want to merge it with defaultProps jssConfig, not replace.
  if (props.jssConfig) {
    mergedProps.jssConfig = {
      ...defaultProps.jssConfig,
      ...props.jssConfig,
    };
  }
  return mergedProps;
}
