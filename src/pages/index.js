import React, { useEffect, useState } from 'react';
import Head from 'next/head';

import Router from 'next/router';

import Error from './_error';

import { pagePropsFactory } from '../lib/page-props-api/page-props-factory';
import { SitecoreContext } from '../lib/SitecoreContext';
import componentFactory from '../temp/componentFactory';
import { useSitecoreTracker } from '@uniformdev/tracking-react';
import Layout from '../components/Layout';
import { StaticAssetContextProvider } from '../lib/StaticAssetContext';
import { SitecorePersonalizationContextProvider } from '@uniformdev/personalize-react';
//
//Uncomment the following line if you want to
//dispatch tracker events to Google Analytics.
// import { GaDispatcher, GaEventConverterForSitecore } from '@uniformdev/tracking';

/**
 * Simple logger to display tracking details in the console.
 * @type Logger
 */
const myLogger = {
  debug: (message, data) => { console.log(new Date().toISOString() + " [Uniform Tracker  DEBUG] " + message, data) },
  error: (message, data) => { console.log(new Date().toISOString() + " [Uniform Tracker  ERROR] " + message, data) },
  info:  (message, data) => { console.log(new Date().toISOString() + " [Uniform Tracker   INFO] " + message, data) },
  trace: (message, data) => { console.log(new Date().toISOString() + " [Uniform Tracker  TRACE] " + message, data) },
  warn:  (message, data) => { console.log(new Date().toISOString() + " [Uniform Tracker   WARN] " + message, data) },
}

const SitecoreRoute = ({ layoutData, statusCode, assetPrefix = '' }) => {
  if (statusCode === 404 || statusCode === 500) {
    return (
      <Error
        statusCode={statusCode}
        context={layoutData && layoutData.sitecore && layoutData.sitecore.context}
      />
    );
  }
  
  //
  //Keep track of client-side route changes.
  const [currentUrl, setCurrentUrl] = useState();
  //
  //Add an event handler for when the route changes.
  useEffect(() => {
    Router.events.on('routeChangeStart', url => {
      setCurrentUrl(url);
    })
  }, []);

  //
  //Register and run the tracker. Since this hook
  //does not run unless the page is refreshed -
  //which doesn't happen with client-side routing -
  //the tracker must be called when the route 
  //changes, as well.
  useSitecoreTracker(layoutData, {
    type: 'jss',
    //
    //Uncomment the following line to change the
    //session timeout. The default value is 20 
    //minutes.
    sessionTimeout: 2,
    //
    //Uncomment the following line to see detailed
    //tracking logging in the JavaScript console.
    // logger: myLogger,
    subscriptions: (subscribe) => {
      //
      //Uncomment the following lines to enable
      //event handlers for visit events. This 
      //demonstrates how you can add custom
      //event handlers for tracker events.
      // subscribe('visit-created', e => console.log("**** visit created", e));
      // subscribe('visit-updated', e => console.log("**** visit updated", e));
    },
    //
    //Uncomment the following section to dispatch
    //tracker data to Google Analytics. Be sure 
    //to set your GA tracking ID.
    // ga: {
    //   trackingIds: ["UA-#########-#"]
    // },
    // dispatchers: [
    //   new GaDispatcher(new GaEventConverterForSitecore(), {
    //     trackingIds: ["UA-#########-#"]
    //   })
    // ]
  });

  //
  //Run the tracker when the layout data changes.
  useEffect(() => {
    //
    //The current url is undefined if the route
    //has not yet changed on the client. In this
    //case, do not run the tracker because it was
    //already run by the tracker hook.
    if (!currentUrl) {
      return;
    }
    //
    //Run the tracker.
    window.uniform.tracker.track('sitecore', layoutData, {
      visitorId: window.uniform.visitor.id,
      createVisitor: true,
    })
  }, [layoutData])

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
          <SitecorePersonalizationContextProvider
            contextData={layoutData}
            contextDataSource="jss"
            //
            //Uncomment the following line to see detailed
            //personalization logging in the JavaScript console.
            // logger={myLogger}
          >
            <Layout route={route} />
          </SitecorePersonalizationContextProvider>
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
