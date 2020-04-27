const { createLogger, format, transports } = require('winston');
const { getBoolEnv } = require('@uniformdev/common');

const { combine, timestamp, colorize, printf } = format;

function paddy(text, padlen) {
    if (padlen <= text.length) return text;

    return ' '.repeat(padlen - text.length) + text;
}

const loggerTransports = [];
const isDebug = getBoolEnv(process.env, 'UNIFORM_OPTIONS_DEBUG', false);
const consoleTransport = new transports.Console({
    level: isDebug ? 'debug' : 'info',
    format: combine(
        timestamp({ format: 'MM/dd-HH:mm:ss' }),
        colorize({ all: true, colors: { debug: 'grey' } }),
        printf((info) => {
            const { timestamp, level, message, ...args } = info;

            // const ts = timestamp.slice(0, 19).replace('T', ' ');
            const lvl = paddy(level, 'debug'.length + 10); // 10 is for color special chars
            return `${timestamp} ${lvl}: ${message} ${
                Object.keys(args).length ? JSON.stringify(args, null, 2) : ''
            }`;
        })
    ),
});

loggerTransports.push(consoleTransport);

if (typeof window === 'undefined') {
    const fileTransport = new transports.File({ filename: '.debug.log', level: 'debug' });
    loggerTransports.push(fileTransport);
}

const serverLogger = createLogger({
    transports: loggerTransports,
});

if (isDebug) {
    serverLogger.debug('Logging initialized at debug level');
}

module.exports = {
    serverLogger,
};
