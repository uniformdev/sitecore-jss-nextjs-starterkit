import React, { useContext, useMemo } from 'react';
// Although the `formatWithValidation` and `addBasePath` functions are declared in the `next-server` package,
// we can still import them for usage in code that will run on the client.
// `next/link` does the same without issue.
import { formatWithValidation } from 'next/dist/next-server/lib/utils';
import { addBasePath } from 'next/dist/next-server/lib/router/router';

import Link from '../../lib/routing/Link';
import { SitecoreContextReactContext } from '../../lib/SitecoreContext';

// When in experience editor, _attempt_ to render "standard" links, e.g. <a href="" /> instead
// of `next/link` components in order to avoid client-side route switches in experience editor.
// Client-side routing will usually break experience editor.
// NOTE: it is _not_ recommended for content editors to use app navigation to navigate between
// pages in experience editor. Especially in a multi-site configuration where the hostname of the
// site being edited may not match the hostname used for logging into the Sitecore CM server.

export default (props) => {
  const sitecoreContextFactory = useContext(SitecoreContextReactContext);
  const sitecoreContext = sitecoreContextFactory.getSitecoreContext();
  const isPageEditingOrPreview =
    sitecoreContext && (sitecoreContext.pageEditing || sitecoreContext.pageState === 'preview');

  // The function is memoized so that no extra lifecycles are needed
  // as per https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html
  // This idea/code borrowed from the `next/link` component.
  const formatUrls = useMemo(() => memoizedFormatUrls, [
    props.href,
    props.asHref,
    sitecoreContext.site.name,
  ]);

  if (isPageEditingOrPreview) {
    // need to resolve the intended `href` of the link here, and append the `sc_site` param.

    // presumably, if an `as` prop is provided, that is the "actual" URL that would be sent in a server request to Sitecore?
    // or not?
    const { href, as } = formatUrls(props.href, props.as, sitecoreContext.site.name);
    const resolvedHref = as || href;

    return (
      <React.Fragment>
        {React.Children.map(props.children, (child) => {
          return React.cloneElement(child, { href: resolvedHref });
        })}
      </React.Fragment>
    );
  } else {
    return <Link {...props} />;
  }
};

// This code largely borrowed from `next/link`.
function memoizedFormatUrls(href, asHref, siteName) {
  const siteNameParam = `sc_site=${siteName}`;
  const formattedHref = addQsParam(addBasePath(formatUrl(href)), siteNameParam);
  const formattedAs = asHref ? addQsParam(addBasePath(formatUrl(asHref)), siteNameParam) : asHref;

  return {
    href: formattedHref,
    as: formattedAs,
  };
}

function addQsParam(url, param) {
  return `${url}${url.indexOf('?') !== -1 ? '&' : '?'}${param}`;
}

function formatUrl(url) {
  return url && typeof url === 'object' ? formatWithValidation(url) : url;
}
