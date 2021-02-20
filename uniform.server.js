// This file doesn't go through babel or webpack transformation.
// Make sure the syntax and sources this file requires are compatible with the current node version you are running
require('./uniform.config')();

const { createUniformServer } = require('@uniformdev/next-jss-server');
const { createPublishProvider } = require('@uniformdev/publishing-all');

const port = process.env.PORT || 3000;
const hostname = process.env.SERVER_HOST_NAME || 'localhost';
const protocol = process.env.SERVER_PROTOCOL || 'http';
const serverUrl = `${protocol}://${hostname}:${port}`;

createUniformServer({
    port,
    serverUrl,
    createPublishProvider,
});
