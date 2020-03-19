import {
  ComponentFactoryReactContext,
  SitecoreContextReactContext,
} from '@sitecore-jss/sitecore-jss-react/dist/components/SitecoreContext';
import SitecoreContextFactory from './SitecoreContextFactory';

export { ComponentFactoryReactContext, SitecoreContextReactContext };

export function SitecoreContext({ componentFactory, children, layoutData }) {
  const contextData = {
    route: null,
    itemId: null,
  };

  if (layoutData && layoutData.sitecore) {
    contextData.route = layoutData.sitecore.route;
    contextData.itemId = layoutData.sitecore.route && layoutData.sitecore.route.itemId;
    Object.assign(contextData, layoutData.sitecore.context);
  }

  SitecoreContextFactory.setSitecoreContext(contextData);

  return (
    <ComponentFactoryReactContext.Provider value={componentFactory}>
      <SitecoreContextReactContext.Provider value={SitecoreContextFactory}>
        {children}
      </SitecoreContextReactContext.Provider>
    </ComponentFactoryReactContext.Provider>
  );
}
