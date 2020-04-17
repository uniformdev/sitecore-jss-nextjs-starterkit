import React, { useContext } from 'react';
import Link from 'next/link';
import { matchRoute } from './routeMatcher';
import { SitecoreContextReactContext } from '../SitecoreContext';

// This component acts as an abstraction around the `next/link` component to:
// 1. Provide the ability to use regex patterns when declaring dynamic routes.
// 2. Help reduce refactoring if routing libraries change.

// This component is intended to accept the same props interface as the `next/link` component.
// Next.js has the concept of dynamic routes / custom routes, but they are not suited for regex
// matching on both server _and_ client.

export default ({ href, ...otherProps }) => {
  const sitecoreContextFactory = useContext(SitecoreContextReactContext);
  const sitecoreContext = sitecoreContextFactory.getSitecoreContext();
  const isPageEditingOrPreview =
    sitecoreContext && (sitecoreContext.pageEditing || sitecoreContext.pageState === 'preview');

  if (href && typeof href === 'string') {
    const { matchedRoute, matchedDefinition } = matchRoute(href);
    if (matchedRoute && matchedDefinition) {
      if (isPageEditingOrPreview) {
        return (
          <EditingLink {...otherProps} href={matchedRoute.path} sitecoreContext={sitecoreContext} />
        );
      }

      return (
        <Link
          {...otherProps}
          href={{ pathname: matchedDefinition.destination, query: matchedRoute.params }}
          as={matchedRoute.path}
        />
      );
    }
  }
  return !isPageEditingOrPreview ? (
    <Link href={href} {...otherProps} />
  ) : (
    <EditingLink href={href} sitecoreContext={sitecoreContext} {...otherProps} />
  );
};

// When in experience editor, _attempt_ to render "standard" links, e.g. <a href="" /> instead
// of `next/link` components in order to avoid client-side route switches in experience editor.
// Client-side routing will usually break experience editor.
// NOTE: it is _not_ recommended for content editors to use app navigation to navigate between
// pages in experience editor. Especially in a multi-site configuration where the hostname of the
// site being edited may not match the hostname used for logging into the Sitecore CM server.
function EditingLink(props) {
  const resolvedHref = `${props.href}?sc_site=${props.sitecoreContext.site.name}`;
  return (
    <React.Fragment>
      {React.Children.map(props.children, (child) => {
        return React.cloneElement(child, { href: resolvedHref });
      })}
    </React.Fragment>
  );
}
