import Document, { Html, Head, Main, NextScript } from 'next/document';
import { serializeEsiLayoutServiceData } from '@uniformdev/esi-jss-ssr';
import { getBoolEnv } from '@uniformdev/common';

// If we are using ESI for personalization then
// the __NEXT_DATA__ written into the html of the
// page needs to be converted from the JSON representation
// to include the esi html tags
//
// You will need to browse the site through the esi docker
// sandbox once this has been turned on otherwise there will
// be errors when Next tries to load in the browser.
// for example:
//
// docker run -ti -p 8080:80 akamaiesi/ets-docker:latest --remote_origin YOUR_LOCAL_IP:3000 --debug YOUR_LOCAL_IP
//
// Then load http://YOUR_LOCAL_IP:3000
const esiEnabled = getBoolEnv(process.env, 'UNIFORM_OPTIONS_ESI', false);
if (esiEnabled) {
    const _getInlineScriptSource = NextScript.getInlineScriptSource;
    NextScript.getInlineScriptSource = (documentProps) => {
        const data = _getInlineScriptSource(documentProps);
        return serializeEsiLayoutServiceData(JSON.parse(data));
    };
}

class MyDocument extends Document {
    render() {
        return (
            <Html>
                <Head />
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;
