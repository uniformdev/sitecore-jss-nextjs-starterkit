// eslint-disable-next-line no-unused-vars
import { CommonFieldTypes, SitecoreIcon, Manifest } from '@sitecore-jss/sitecore-jss-manifest';

/**
 * Adds the Hero component to the disconnected manifest.
 * This function is invoked by convention (*.sitecore.js) when `jss manifest` is run.
 * @param {Manifest} manifest Manifest instance to add components to
 */
export default function(manifest) {
  manifest.addComponent({
    name: 'Hero',
    displayName: 'Hero',
    // totally optional, but fun
    icon: 'software/16x16/component_yellow.png',
    fields: [
      { name: 'title', type: CommonFieldTypes.SingleLineText, section: 'Content' },
      { name: 'subtitle', type: CommonFieldTypes.SingleLineText, section: 'Content' },
      { name: 'text', type: CommonFieldTypes.RichText, section: 'Content' },
      { name: 'image', type: CommonFieldTypes.SingleLineText, section: 'Content' },
      { name: 'primaryCTALink', type: CommonFieldTypes.GeneralLink, section: 'Call to action' },
      { name: 'primaryCTATitle', type: CommonFieldTypes.SingleLineText, section: 'Call to action' },
      { name: 'secondaryCTALink', type: CommonFieldTypes.GeneralLink, section: 'Call to action' },
      {
        name: 'secondaryCTATitle',
        type: CommonFieldTypes.SingleLineText,
        section: 'Call to action',
      },
    ],
  });
}
