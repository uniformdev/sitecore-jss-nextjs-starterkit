import Link from 'next/link';
import { matchRoute } from './routeMatcher';

// This component acts as an abstraction around the `next/link` component to:
// 1. Provide the ability to use regex patterns when declaring dynamic routes.
// 2. Help reduce refactoring if routing libraries change.

// This component is intended to accept the same props interface as the `next/link` component.
// Next.js has the concept of dynamic routes / custom routes, but they are not suited for regex
// matching on both server _and_ client.

export default ({ href, ...otherProps }) => {
  if (href && typeof href === 'string') {
    const { matchedRoute, matchedDefinition } = matchRoute(href);
    if (matchedRoute && matchedDefinition) {
      return (
        <Link
          {...otherProps}
          href={{ pathname: matchedDefinition.destination, query: matchedRoute.params }}
          as={matchedRoute.path}
        />
      );
    }
  }
  return <Link href={href} {...otherProps} />;
};
