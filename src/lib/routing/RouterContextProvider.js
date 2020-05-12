import React from 'react';
import { useRouter } from 'next/router';
import { enhanceRouter } from './Router';

export const RouterContext = React.createContext(null);

export default ({ children, routeDefinitions }) => {
  const nextRouter = useRouter();
  const enhancedRouter = enhanceRouter(nextRouter, routeDefinitions);
  return (
    <RouterContext.Provider value={{ router: enhancedRouter }}>{children}</RouterContext.Provider>
  );
};
