import React from 'react';
import Link from 'next/link';
import { useRouter } from './useRouter';

export default (props) => {
  const router = useRouter();
  const { href, as: asProp, ...otherProps } = props;

  // NOTE: `href` can be a string or a Node URL object, `router.matchRoute` will handle either.
  const { route, params } = router.matchRoute(href);
  const resolvedHref = route ? route.getHref(params) : href;
  const resolvedAs = asProp || href;

  return <Link {...otherProps} href={resolvedHref} as={resolvedAs} />;
};
