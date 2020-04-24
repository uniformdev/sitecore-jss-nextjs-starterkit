import React from 'react';
import NextApp from 'next/app';
import i18n from 'i18next';
import { i18init } from '../lib/i18n';
import RouterContextProvider from '../lib/routing/RouterContextProvider';
import { routeDefinitions } from '../lib/routing/routeDefinitions';
import '../styles/style.css';

export default class App extends NextApp {
  render() {
    const { Component, pageProps } = this.props;
    // If `pageProps.dictionary` is defined and `i18n` isn't initialized, we assume
    // the app is being hydrated with SSR data and initialize `i18n` accordingly.
    if (pageProps.dictionary && !i18n.isInitialized) {
      // when passing in a dictionary that is defined, our i18init function
      // will set an option to immediately initialize the i18n instance instead
      // of initializing i18n asynchronously.
      i18init(pageProps.language, pageProps.dictionary);
    }
    return (
      <RouterContextProvider routeDefinitions={routeDefinitions}>
        <Component {...pageProps} />
      </RouterContextProvider>
    );
  }
}
