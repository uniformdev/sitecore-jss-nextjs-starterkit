const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.UNIFORM_API_KEY;
const layoutServiceHost = process.env.UNIFORM_API_URL;

const scjssConfig = {
  sitecore: {
    instancePath: '',
    apiKey,
    deploySecret: '',
    deployUrl: '',
    layoutServiceHost,
  },
};

const writeStream = fs.createWriteStream('scjssconfig.json');
writeStream.write(JSON.stringify(scjssConfig));
writeStream.end();
