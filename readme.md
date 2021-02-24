# Uniform - Sitecore JSS - Next.js starter kit

This repo contains both the starter kit with content items and required configuration files.

You can also use this kit to start a vanilla project, simply remove everything from `/src/components` and adjust the Sitecore site name from `uniform-jss-kit` to whatever you want and get cracking.

## Docs

1. [Tutorial for this starter kit](https://docs.uniform.dev/sitecore/deploy/getting-started/sitecore-jss-nextjs-tutorial)

1. [Uniform for Sitecore docs](https://docs.uniform.dev/sitecore/deploy/introduction/)


## Pre-requisites
1. Sitecore 9.x-10.x instance available with Sitecore JSS installed and configured
1. "Uniform for Sitecore" installed and configured on your Sitecore instance. Check out the docs.
1. Install the Sitecore package with items from `/sitecore/App_Data/packages` folder.
1. Deploy the configs from `/sitecore/App_Config` folder to your Sitecore instance's `App_Config` folder (the subfolder structure should match).

## Known issues
1. @sitecore-jss v15.0 npm packages are not supported yet, make sure to use `14.0.1` versions.

## Getting started with the app

> Check out official docs for more scenarios and [tutorial](https://docs.uniform.dev/sitecore/deploy/getting-started/sitecore-jss-nextjs-tutorial).

### TL;DR version

1. Configure `.env` file according to your environment specifics (see `.env-example` file).
1. Create `.npmrc` file with NPM_TOKEN, so you can download the `@uniformdev` packages.
1. `npm install`
1. `npm run dev` to start development server.
1. `npm run export` to start static export.