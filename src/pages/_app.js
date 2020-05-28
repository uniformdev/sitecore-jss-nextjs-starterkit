import React from 'react';
import NextApp from 'next/app';
import { i18init, isInitialized as isi18nInitialized } from '../lib/i18n/i18n-manager';
import RouterContextProvider from '../lib/routing/RouterContextProvider';
import { routeDefinitions } from '../lib/routing/routeDefinitions';
import '../styles/style.css';

export default class App extends NextApp {
  render() {
    const { Component, pageProps } = this.props;
    // If i18n is not initialized, then do so.
    if (!isi18nInitialized()) {
      // `pageProps.dictionary` _should_ already be defined at this point, both
      // in SSR and client-side hydration.
      // Therefore, our i18init function will set an option to immediately
      // initialize the i18n instance instead of initializing i18n asynchronously.
      i18init(pageProps.language, pageProps.dictionary);
    }
    return (
      <RouterContextProvider routeDefinitions={routeDefinitions}>
        <Component {...pageProps} />
      </RouterContextProvider>
    );
  }
}
