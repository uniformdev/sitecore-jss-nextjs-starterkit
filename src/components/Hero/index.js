import React, { useState } from 'react';
import { Text, Link } from '@sitecore-jss/sitecore-jss-react';
import Logo from '../Logo';
import NavLinks from '../NavLinks';

const Hero = ({ fields }) => {
  if (!fields) {
    return null;
  }

  const [menuOpened, setOpenMenu] = useState(false);

  const {
    title,
    subtitle,
    text,
    primaryCTATitle,
    primaryCTALink,
    secondaryCTATitle,
    secondaryCTALink,
  } = fields;

  const desktopMenu = (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
      <nav className="relative flex items-center justify-between sm:h-10 md:justify-center">
        <div className="flex items-center flex-1 md:absolute md:inset-y-0 md:left-0">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="h-8 w-auto sm:h-10">
              <Logo />
            </div>
            <div className="-mr-2 flex items-center md:hidden">
              <button
                type="button"
                onClick={() => setOpenMenu(true)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out"
              >
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="hidden md:block">
          <NavLinks />
        </div>
        <div className="hidden md:absolute md:flex md:items-center md:justify-end md:inset-y-0 md:right-0">
          <span className="inline-flex rounded-md shadow">
            <a
              href="mailto:hi@unfrm.io"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base leading-6 font-medium rounded-md text-red-500 bg-white hover:text-red-500 focus:outline-none focus:shadow-outline-blue active:bg-gray-50 active:text-red-700 transition duration-150 ease-in-out"
            >
              Contact Us
            </a>
          </span>
        </div>
      </nav>
    </div>
  );

  const mobileMenu = (
    <div className="absolute top-0 inset-x-0 p-2 md:hidden">
      <div className="rounded-lg shadow-md transition transform origin-top-right">
        <div className="rounded-lg bg-white shadow-xs overflow-hidden">
          <div className="px-5 pt-4 flex items-center justify-between">
            <div>
              <div className="h-8 w-auto">
                <Logo />
              </div>
            </div>
            <div className="-mr-2">
              <button
                onClick={() => setOpenMenu(false)}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out"
              >
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="px-2 pt-2 pb-3">
            <NavLinks />
          </div>
          <div>
            <a
              href="mailto:hi@unfrm.io"
              className="block w-full px-5 py-3 text-center font-medium text-red-500 bg-gray-50 hover:bg-gray-100 hover:text-red-700 focus:outline-none focus:bg-gray-100 focus:text-red-700 transition duration-150 ease-in-out"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative bg-gray-50 overflow-hidden">
      <div className="hidden sm:block sm:absolute sm:inset-y-0 sm:h-full sm:w-full">
        <div className="relative h-full max-w-screen-xl mx-auto">
          <svg
            className="absolute right-full transform translate-y-1/4 translate-x-1/4 lg:translate-x-1/2"
            width="404"
            height="784"
            fill="none"
            viewBox="0 0 404 784"
          >
            <defs>
              <pattern
                id="svg-pattern-squares-1"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <rect
                  x="0"
                  y="0"
                  width="4"
                  height="4"
                  className="text-gray-200"
                  fill="currentColor"
                />
              </pattern>
            </defs>
            <rect width="404" height="784" fill="url(#svg-pattern-squares-1)" />
          </svg>
          <svg
            className="absolute left-full transform -translate-y-3/4 -translate-x-1/4 md:-translate-y-1/2 lg:-translate-x-1/2"
            width="404"
            height="784"
            fill="none"
            viewBox="0 0 404 784"
          >
            <defs>
              <pattern
                id="svg-pattern-squares-2"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <rect
                  x="0"
                  y="0"
                  width="4"
                  height="4"
                  className="text-gray-200"
                  fill="currentColor"
                />
              </pattern>
            </defs>
            <rect width="404" height="784" fill="url(#svg-pattern-squares-2)" />
          </svg>
        </div>
      </div>
      <div className="relative pt-6 pb-12 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
        {menuOpened ? mobileMenu : desktopMenu}
        <div className="mt-10 mx-auto max-w-screen-xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 xl:mt-28">
          <div className="text-center">
            <h2 className="text-4xl tracking-tight leading-10 font-extrabold text-gray-900 sm:text-5xl sm:leading-none md:text-6xl">
              <Text field={title} />
              <br className="xl:hidden" />{' '}
              <Text field={subtitle} tag="span" className="text-red-500" />
            </h2>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              <Text field={text} />
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              {primaryCTATitle &&
                primaryCTALink &&
                primaryCTALink.value &&
                primaryCTALink.value.href && (
                  <div className="rounded-md shadow">
                    <Link
                      field={primaryCTALink}
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-red-500 hover:bg-red-500 focus:outline-none focus:shadow-outline-red transition duration-150 ease-in-out md:py-4 md:text-lg md:px-10"
                    >
                      <Text field={primaryCTATitle} />
                    </Link>
                  </div>
                )}
              {secondaryCTATitle &&
                secondaryCTALink &&
                secondaryCTALink.value &&
                secondaryCTALink.value.href && (
                  <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                    <Link
                      field={secondaryCTALink}
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-red-500 bg-white hover:text-red-500 focus:outline-none focus:shadow-outline-blue transition duration-150 ease-in-out md:py-4 md:text-lg md:px-10"
                    >
                      <Text field={secondaryCTATitle} />
                    </Link>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
