const shell = require('./shell');
const path = require('path');

/**
 * @param {object} config
 * @param {string} config.root
 * @param {string} config.prefix
 * @param {string[]} config.args
 */
module.exports = function (config) {
  config = {
    prefix: '',
    args: [],
    ...config,
  }

  const pathToMochaSetup = path.relative(config.root, path.resolve(__dirname, '../configs/mocha-setup.js'));

  return shell.exec(`mocha -r ts-node/register --require .\\${pathToMochaSetup} ./src/**/*.tests.tsx?`);
}