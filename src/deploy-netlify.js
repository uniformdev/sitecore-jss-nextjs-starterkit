const dotenv = require('dotenv');
dotenv.config();

const { NetlifyPublishProvider } = require('@uniformdev/publishing-netlify');
new NetlifyPublishProvider(console).deploy('out');
