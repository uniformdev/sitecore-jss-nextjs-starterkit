import React from 'react';

// Renders a basic error page.

// By default, if `statusCode` is 404 then the `context` prop _should_ have
// Layout Service Context data, but no route data.
// If the `statusCode` is some other value, then `context` prop will likely be undefined/null.

const ErrorPage = (props) => {
  const { context, statusCode, error } = props;
  const siteName = context && context.site && context.site.name ? context.site.name : '';
  const languageName = context && context.site && context.language ? context.language : '';

  if (statusCode === 500 && error) {
    console.error(error);
  }

  return (
    <React.Fragment>
      <h1>An error occurred.</h1>
      <p>Status code: {statusCode}.</p>
      <p>
        Site: {siteName}
        <br />
        Language: {languageName}
      </p>
    </React.Fragment>
  );
};

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
