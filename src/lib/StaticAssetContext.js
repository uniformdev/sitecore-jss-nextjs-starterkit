import { createContext } from 'react';

export const StaticAssetContext = createContext();

// This will act as our "store" for the asset prefix. We generally
// only receive an `assetPrefix` value from SSR hydration. However,
// on client-side route change, the `getInitialProps` method is executed and will
// pass an empty `assetPrefix` value into the app. We want to preserve the
// `assetPrefix` value between client-side route changes, so we store the
// initial value here and only change it if a _defined_ assetPrefix value is received.
let currentAssetPrefix = '';

export const StaticAssetContextProvider = ({ assetPrefix = '', children }) => {
  if (assetPrefix) {
    currentAssetPrefix = assetPrefix;
  }

  return (
    <StaticAssetContext.Provider value={{ assetPrefix: currentAssetPrefix }}>
      {children}
    </StaticAssetContext.Provider>
  );
};
