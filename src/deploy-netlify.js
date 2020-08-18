const dotenv = require('dotenv');
dotenv.config();

const { NetlifyPublishProvider } = require('@uniformdev/publishing-netlify');
const { parseUniformServerConfig } = require('@uniformdev/common-server');

const config = parseUniformServerConfig(process.env, console);

new NetlifyPublishProvider({
    config, 
    logger: console
}).deploy('out');
