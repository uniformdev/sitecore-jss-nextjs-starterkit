import React from 'react';

// Renders a route-not-found message when no route is available from Sitecore
// The JSS equivalent of a 404 Not Found page.

// The NotFound component receives the Layout Service Context data, but no route data.
// This can be used to power parts of your site, such as navigation, from LS context additions
// without losing the ability to render them on your 404 pages :)

const NotFound = (props) => {
  const { context } = props;
  const siteName = context && context.site && context.site.name ? context.site.name : '';
  const languageName = context && context.site && context.language ? context.language : '';

  return (
    <React.Fragment>
      <h1>Page not found</h1>
      <p>This page does not exist.</p>
      <p>
        Site: {siteName}
        <br />
        Language: {languageName}
      </p>
    </React.Fragment>
  );
};

export default NotFound;
