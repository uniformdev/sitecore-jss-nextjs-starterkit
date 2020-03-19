const dotenv = require('dotenv');
dotenv.config();

const { AwsS3PublishProvider } = require('@uniformdev/publishing-awss3');
new AwsS3PublishProvider(console).deploy('out');
