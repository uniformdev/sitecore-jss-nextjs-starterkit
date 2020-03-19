import React from 'react';
import Head from 'next/head';

import i18n from 'i18next';

import Error from './_error';
import { getRouteData } from '../lib/nextLayoutServiceUtil';
import { SitecoreContext } from '../lib/SitecoreContext';
import getConfig from '../temp/config';
import componentFactory from '../temp/componentFactory';
import Layout from '../components/Layout';
import { i18init } from '../lib/i18n';
import { StaticAssetContextProvider } from '../lib/StaticAssetContext';

const SitecoreRoute = ({ layoutData, statusCode, assetPrefix = '' }) => {
  if (statusCode === 404) {
    return (
      <Error
        statusCode={statusCode}
        context={layoutData && layoutData.sitecore && layoutData.sitecore.context}
      />
    );
  }

  const route = layoutData && layoutData.sitecore && layoutData.sitecore.route;

  return (
    <StaticAssetContextProvider assetPrefix={assetPrefix}>
      <div>
        <Head>
          <title>
            {(route && route.fields && route.fields.pageTitle && route.fields.pageTitle.value) ||
              'Page'}
          </title>

          <link rel="shortcut icon" href="/static/favicon.ico" />
        </Head>
        <SitecoreContext componentFactory={componentFactory} layoutData={layoutData}>
          <Layout route={route} />
        </SitecoreContext>
      </div>
    </StaticAssetContextProvider>
  );
};

// For the initial page load, `getInitialProps` will execute on the server only.
// `getInitialProps` will only be executed on the client when navigating to a
// different route via the `Link` component or using the routing APIs.
SitecoreRoute.getInitialProps = ({ pathname, query, asPath, req, res, err }) => {
  const config = getConfig();

  const props = {
    layoutData: null,
    statusCode: 200,
    dictionary: null,
    language: (i18n.isInitialized && i18n.language) || config.defaultLanguage,
    assetPrefix: '',
    jssConfig: {},
  };

  // If an `assetPrefix` property is attached to the `req` object, then pass it
  // in as a prop. This approach will usually only be used when the app is being rendered
  // via JSS rendering host, but may be useful in other situations, so we
  // always check for the value.
  if (req && req.assetPrefix) {
    props.assetPrefix = req.assetPrefix;
  }

  // For JSS Integrated Mode, you will use the JSS rendering host which
  // will set the `isJssRenderingHostRequest` value.
  // note: `req` is only defined during SSR.
  if (req && req.isJssRenderingHostRequest) {
    // If we have `jssConfig`, assign it to the initial props.
    // While this makes the `jssConfig` available as a prop to the app, it also makes
    // the config available via SSR state that is serialized to the HTML document via `__NEXT_DATA__`.
    // Which is useful for ensuring the config is available to client code and we can
    // use the config to override the generated config values when necessary.
    if (req.jssConfig) {
      props.jssConfig = req.jssConfig;
    }
    // If we have `jssData`, then use it.
    if (req.jssData) {
      props.language = req.jssData.viewBag.language;
      props.dictionary = req.jssData.viewBag.dictionary;
      props.layoutData = req.jssData.route;
    }
    return props;
  }

  const promises = [];

  // This condition should only be true for SSR.
  // If in SSR, we need to initialize i18n using the route language parameter, using the default language as fallback.
  if (req) {
    const language = query.lang || config.defaultLanguage;
    promises.push(
      i18init(language, null).then(() => {
        props.language = language;
        const data = i18n.getDataByLanguage(language);
        if (data) {
          props.dictionary = data.translation;
        } else {
          console.warn(`i18n.getDataByLanguage(${language}) is null`);
        }
      })
    );
  }
  // This condition should be true for client-side route change.
  else if (!req && query.lang && i18n.isInitialized && i18n.language !== query.lang) {
    promises.push(
      i18n.changeLanguage(query.lang).then(() => {
        props.language = query.lang;
      })
    );
  }

  // If we don't have `jssData`, then attempt to fetch it from layout service.
  // This is desired for both node SSR and CSR.
  promises.push(
    getRouteData(
      query.sitecoreRoute || asPath,
      // determine language by route first, then by "state" (i18n.language), else fallback to config
      query.lang || (i18n.isInitialized && i18n.language) || config.defaultLanguage
    ).then((result) => {
      if (result && result.sitecore && result.sitecore.route) {
        props.layoutData = result;
      } else {
        // If no route data was fetched, then:

        // Set a 404 status code on the response. Note: `res` is only defined during SSR
        if (res) {
          res.statusCode = 404;
        }

        // Pass a statusCode as prop for any interested components.
        props.statusCode = 404;
        // Also be sure to return the layout data as it will contain `context` data returned by Layout Service.
        props.layoutData = result;
      }
    })
  );

  // Dictionary service and layout service requests can resolve in parallel.
  return Promise.all(promises)
    .then(() => {
      return props;
    })
    .catch((err) => {
      console.error(err);
      return props;
    });
};

export default SitecoreRoute;
