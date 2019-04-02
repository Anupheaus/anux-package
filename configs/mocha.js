const path = require('path');
const callerId = require('caller-id');
const fs = require('fs');

/**
 * @param {object} config
 * @param {boolean} config.enableReact
 */
module.exports = function (config) {
  const { filePath } = callerId.getData();
  const root = path.dirname(filePath);
  process.env['test-config'] = JSON.stringify({ ...config, root });
  const requiredModules = [
    'ts-node/register',
    'jsdom-global/register',
    path.relative(root, path.resolve(__dirname, './test-setup.js')),
  ];
  try {
    require.resolve('anux-common');
    requiredModules.push('anux-common');
  } catch (e) { }
  return {
    require: requiredModules,
    spec: './src/**/*.tests.+(ts|tsx)',
  };
};
