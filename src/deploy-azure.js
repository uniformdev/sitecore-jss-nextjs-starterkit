const dotenv = require('dotenv');
dotenv.config();

const { AzurePublishProvider } = require('@uniformdev/publishing-azureblobstorage');
new AzurePublishProvider(console).deploy('out');
