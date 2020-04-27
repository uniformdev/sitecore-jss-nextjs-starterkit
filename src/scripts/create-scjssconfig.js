const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

create();

function create() {
  // In local dev environment, we don't want to overwrite the scjssconfig file, because it's annoying
  // having to restore the file when it gets overwritten during local export testing.
  if (process.env.EXPORT_ENV === 'development') {
    return;
  }

  const apiKey = process.env.UNIFORM_API_KEY;
  const layoutServiceHost = process.env.UNIFORM_API_URL;

  const scjssConfig = {
    sitecore: {
      apiKey,
      layoutServiceHost,
    },
  };

  // File path is relative to the process invocation path, e.g. `process.cwd()`
  // NOTE: this will overwrite any existing `scjssconfig.json` file.
  fs.writeFileSync('scjssconfig.json', JSON.stringify(scjssConfig, null, 2));
}
