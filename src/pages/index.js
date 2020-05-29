import React from 'react';
import Head from 'next/head';

import Error from './_error';

import { pagePropsFactory } from '../lib/page-props-api/page-props-factory';
import { SitecoreContext } from '../lib/SitecoreContext';
import componentFactory from '../temp/componentFactory';
import Layout from '../components/Layout';
import { StaticAssetContextProvider } from '../lib/StaticAssetContext';

const SitecoreRoute = ({ layoutData, statusCode, assetPrefix = '' }) => {
  if (statusCode === 404 || statusCode === 500) {
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

          <link rel="shortcut icon" href="/favicon.ico" />
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
SitecoreRoute.getInitialProps = ({ query, req, res }) => {
  return pagePropsFactory({ req, query })
    .then((props) => {
      // If 404 was resolved in props, set a 404 status code on the response.
      // Note: `res` is only defined during SSR.
      if (res && props.statusCode === 404) {
        res.statusCode = 404;
      }
      return props;
    })
    .catch((error) => {
      return {
        statusCode: 500,
        error,
        layoutData: { sitecore: { context: {} } },
      };
    });
};

export default SitecoreRoute;
