const path = require('path');
const callerId = require('caller-id');

function addIfExists(dependency) {
  try {
    require.resolve(dependency);
    return dependency;
  } catch (e) {
    if (e.message && e.message.toLowerCase() === `cannot find module '${dependency}'`) {
      return undefined;
    } else {
      throw e;
    }
  }
}

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
      addIfExists('anux-common'),
      path.relative(root, path.resolve(__dirname, './test-setup.js')),
    ].filter(v => v != null),
    spec: './src/**/*.tests.+(ts|tsx)',
  };
};
