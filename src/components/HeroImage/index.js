import React, { useState } from 'react';
import { Text, Link } from '@sitecore-jss/sitecore-jss-react';
import Logo from '../Logo';
import NavLinks from '../NavLinks';
import NavLinksAlt from '../NavLinksAlt';

const HeroImage = ({ children, fields }) => {
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
    image,
  } = fields;

  const desktopMenu = (
    <div className="pt-6 px-4 sm:px-6 lg:px-8">
      <nav className="relative flex items-center justify-between sm:h-10 lg:justify-start">
        <div className="flex items-center flex-grow flex-shrink-0 lg:flex-grow-0">
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
        <div className="hidden md:block md:ml-10 md:pr-4">
          <NavLinks />
        </div>
      </nav>
    </div>
  );

  const mobileMenu = (
    <div className="absolute top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden">
      <div className="rounded-lg shadow-md">
        <div className="rounded-lg bg-white shadow-xs overflow-hidden">
          <div className="px-5 pt-4 flex items-center justify-between">
            <div>
              <div className="h-8 w-auto">
                <Logo />
              </div>
            </div>
            <div className="-mr-2">
              <button
                type="button"
                onClick={() => setOpenMenu(false)}
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
            <NavLinksAlt />
          </div>
          <div>
            <a
              href="mailto:hi@unfrm.io"
              className="block w-full px-5 py-3 text-center font-medium text-red-600 bg-gray-50 hover:bg-gray-100 hover:text-red-700 focus:outline-none focus:bg-gray-100 focus:text-red-700 transition duration-150 ease-in-out"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-screen-xl mx-auto ">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          {menuOpened ? mobileMenu : desktopMenu}
          <div className="mt-10 mx-auto max-w-screen-xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h2 className="text-4xl tracking-tight leading-10 font-extrabold text-gray-900 sm:text-5xl sm:leading-none md:text-6xl">
                <Text field={title} />
                <br className="xl:hidden" />{' '}
                <Text field={subtitle} tag="span" className="text-red-500" />
              </h2>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                <Text field={text} />
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                {children}
                {primaryCTATitle &&
                  primaryCTALink &&
                  primaryCTALink.value &&
                  primaryCTALink.value.href && (
                    <div className="rounded-md shadow">
                      <Link
                        field={primaryCTALink}
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-red-500 hover:bg-red-500 focus:outline-none focus:shadow-outline transition duration-150 ease-in-out md:py-4 md:text-lg md:px-10"
                      >
                        <Text field={primaryCTATitle} />
                      </Link>
                    </div>
                  )}
                {secondaryCTATitle &&
                  secondaryCTALink &&
                  secondaryCTALink.value &&
                  secondaryCTALink.value.href && (
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <Link
                        field={secondaryCTALink}
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-red-700 bg-red-100 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:shadow-outline focus:border-red-300 transition duration-150 ease-in-out md:py-4 md:text-lg md:px-10"
                      >
                        <Text field={secondaryCTATitle} />
                      </Link>
                    </div>
                  )}
              </div>
            </div>
          </div>
          <svg
            className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
            fill="currentColor"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          src={image.value}
          alt=""
        />
      </div>
    </div>
  );
};

export default HeroImage;
