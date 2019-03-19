const path = require('path');

/**
 * @param {object} config
 * @param {boolean} config.enableReact
 */
module.exports = function (config) {
  process.env['test-config'] = JSON.stringify(config);
  return {
    require: [
      'ts-node/register',
      'anux-common',
      path.resolve(__dirname, './test-setup.js'),
    ],
    spec: './src/**/*.tests.ts?',
  };
};
