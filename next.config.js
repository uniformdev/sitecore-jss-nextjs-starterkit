require('./uniform.config')();
const { withUniform } = require('@uniformdev/next-jss-server');

module.exports = withUniform({
    experimental: {
        // This is experimental but can
        // be enabled to allow parallel threads
        // with nextjs automatic static generation
        workerThreads: false,
    },
});
