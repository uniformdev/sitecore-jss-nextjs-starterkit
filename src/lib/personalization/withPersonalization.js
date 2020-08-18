import React from 'react';
import { useSitecorePersonalization } from '@uniformdev/personalize-react';

export function withPersonalization(Component, args) {
  const PersonalizationWrapper = (props) => {
    const result = useSitecorePersonalization({ ...props, ...args });
    const { loading, error, personalizedProps } = result;
    //
    //
    if (error) {
      console.error(`There was an error personalizing a component: ${error}`, Component);
    }
    //
    //
    return (
      <React.Fragment>
        <LoadingOverlay isActive={loading} />
        <Component {...personalizedProps} />
      </React.Fragment>
    );
  };

  PersonalizationWrapper.displayName =
    Component.displayName || Component.name || 'PersonalizationWrapper';

  return PersonalizationWrapper;
}

// A minimal React port of vue-loading-overlay: https://github.com/ankurk91/vue-loading-overlay
// The styles for this component assume that it will be rendered within a container element
// that has `position: relative` assigned.
export function LoadingOverlay({ isActive, iconColor = '#000' }) {
  const overlayStyles = {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    alignItems: 'center',
    display: isActive ? 'flex' : 'none',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 9999,
  };

  const backgroundStyles = {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    background: '#fff',
    opacity: 0.5,
  };

  const iconStyles = {
    position: 'relative',
  };

  return (
    <div style={overlayStyles}>
      <div style={backgroundStyles}></div>
      <div style={iconStyles}>
        <svg
          viewBox="0 0 38 38"
          xmlns="http://www.w3.org/2000/svg"
          width="128"
          height="128"
          stroke={iconColor}
        >
          <g fill="none" fillRule="evenodd">
            <g transform="translate(1 1)" strokeWidth="2">
              <circle strokeOpacity=".25" cx="18" cy="18" r="18"></circle>
              <path d="M36 18c0-9.94-8.06-18-18-18" transform="rotate(166.645 18 18)">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 18 18"
                  to="360 18 18"
                  dur="0.8s"
                  repeatCount="indefinite"
                ></animateTransform>
              </path>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
