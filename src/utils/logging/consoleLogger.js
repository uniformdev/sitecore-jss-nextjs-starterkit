import log from 'loglevel';
import { getBoolEnv } from '@uniformdev/common';

// Be sure to set a level in order for loglevel to bind to the console properly.
// Otherwise, the exported logger instance will have `noop` functions for all
// console methods.
// Likely an issue due to how loglevel exports itself.

// NOTE: be _sure_ that UNIFORM_OPTIONS_DEBUG gets exposed via WebpackDefinePlugin.
// Next config has a `env` property that can be set to ensure this happens at build time.
const { getNextConfig } = require('@uniformdev/next');
const level = getBoolEnv(getNextConfig(), 'UNIFORM_OPTIONS_DEBUG', false) ? 'debug' : 'warn';
log.setLevel(level);

export const consoleLogger = log;
