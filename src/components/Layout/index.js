import React from 'react';
import { Placeholder } from '@sitecore-jss/sitecore-jss-react';
import Footer from '../Footer';

export default function Layout({ route }) {
  return (
    <>
      <Placeholder name="uniform-jss-content" rendering={route} />
      <Footer />
    </>
  );
}
