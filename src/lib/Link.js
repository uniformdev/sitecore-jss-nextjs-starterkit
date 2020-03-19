import { Link } from './routeDefinitions';

// This component acts as an abstraction around router links to help reduce refactoring if routing libraries change.
// It is intended to accept the same props interface as the `next/link` component, then transform
// those props into the props expected by the `next-routes` Link component.
// NOTE: the `next-routes` Link component does not 100% match the `next/link` component options available in Next 9.x.
// In particular, the `href` prop is supposed to allow all properties defined in the Node.js URL module, but the
// `next-routes` Link component doesn't allow that.
export default ({ href, ...otherProps }) => {
  const props = otherProps;
  if (href && typeof href !== 'string') {
    // if `href` isn't a string, assume it is an object and parse the object into props
    // expected by the next-routes package.
    props.route = href.pathname;
    props.params = href.query;
  } else if (href && typeof href === 'string') {
    props.route = href;
  } else {
    props.href = href;
  }

  return <Link {...props} />;
};
