const dotenv = require('dotenv');
dotenv.config();
const { createPublishProvider } = require('@uniformdev/publishing-all');
createPublishProvider().deploy('out');