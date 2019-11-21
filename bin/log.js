/* eslint-disable no-console */
const chalk = require('chalk');

function logError(message) {
  console.error(chalk`{red ${(new Date()).toUTCString()} - ERROR: ${message}}`);
}

function logWarn(message) {
  console.warn(chalk`{yellow ${(new Date()).toUTCString()} - ${message}}`);
}

function logInfo(message) {
  console.error(chalk`{green ${(new Date()).toUTCString()} - ${message}}`);
}

module.exports = {
  logError,
  logWarn,
  logInfo,
};
