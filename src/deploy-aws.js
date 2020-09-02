const dotenv = require('dotenv');
dotenv.config();

const { AwsS3PublishProvider } = require('@uniformdev/publishing-awss3');
const { parseUniformServerConfig } = require('@uniformdev/common-server');

const config = parseUniformServerConfig(process.env, console);

new AwsS3PublishProvider({
    config, 
    logger: console
}).deploy('out');
