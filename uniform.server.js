// This file doesn't go through babel or webpack transformation.
// Make sure the syntax and sources this file requires are compatible with the current node version you are running
require('./uniform.config')();

const { createUniformServer } = require('@uniformdev/next-jss-server');
const { createPublishProvider } = require('@uniformdev/publishing-all');

const port = process.env.PORT || 3000;
const serverUrl = `http://0.0.0.0:${port}`

createUniformServer({
    port,
    serverUrl,
    createPublishProvider,
});
