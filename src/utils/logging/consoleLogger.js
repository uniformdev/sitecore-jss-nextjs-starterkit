const log = require('loglevel');

// Be sure to set a level in order for loglevel to bind to the console properly.
// Otherwise, the exported logger instance will have `noop` functions for all
// console methods.
// Likely an issue due to how loglevel exports itself.

const level = process.env.UNIFORM_OPTIONS_DEBUG === '1' ? 'debug' : 'info';

log.setLevel(level);

exports.consoleLogger = log;
