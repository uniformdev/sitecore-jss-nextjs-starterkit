import React from 'react';
import NextApp from 'next/app';

if (typeof window === 'undefined') {
    require('@uniformdev/next-jss-server').configure();
}

export default class App extends NextApp {
    render() {
        const { Component, pageProps } = this.props;
        return <Component {...pageProps} />;
    }
}
