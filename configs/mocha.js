const path = require('path');

function addIfExists(dependency) {
  try {
    require.resolve(dependency);
    return dependency;
  } catch (e) {
    if (e.message && e.message.toLowerCase().includes('cannot find module')) {
      return undefined;
    } else {
      throw e;
    }
  }
}

module.exports = (function () {
  const root = process.cwd();
  // process.env['test-config'] = JSON.stringify({ root });  
  process.env['is-mocha'] = true;
  return {
    require: [
      'ts-node/register',
      addIfExists('jsdom-global/register'),
      addIfExists('anux-common'),
      path.relative(root, path.resolve(__dirname, './test-setup.js')),
    ].filter(v => v != null),
    spec: './src/**/*.tests.+(ts|tsx)',
  };
})();
