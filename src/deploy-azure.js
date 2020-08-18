const dotenv = require('dotenv');
dotenv.config();

const { AzurePublishProvider } = require('@uniformdev/publishing-azureblobstorage');
const { parseUniformServerConfig } = require('@uniformdev/common-server');

const config = parseUniformServerConfig(process.env, console);

new AzurePublishProvider({
    config, 
    logger: console
}).deploy('out');
