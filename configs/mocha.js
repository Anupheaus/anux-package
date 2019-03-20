const path = require('path');
const callerId = require('caller-id');

/**
 * @param {object} config
 * @param {boolean} config.enableReact
 */
module.exports = function (config) {
  const { filePath } = callerId.getData();
  const root = path.dirname(filePath);
  process.env['test-config'] = JSON.stringify({ ...config, root });
  return {
    require: [
      'ts-node/register',
      'jsdom-global/register',
      'anux-common',
      path.relative(root, path.resolve(__dirname, './test-setup.js')),
    ],
    spec: './src/**/*.tests.+(ts|tsx)',
  };
};
