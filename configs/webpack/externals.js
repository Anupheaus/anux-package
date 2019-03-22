const path = require('path');
const fs = require('fs');
const nodeExternals = require('webpack-node-externals');

function addNodeModules(options) {
  if (options.target !== 'node') { return; }
  const packageNodeModules = path.resolve(options.root, 'node_modules');
  const rootNodeModules = path.resolve(__dirname, '../node_modules');
  return fs.readdirSync(rootNodeModules)
    .concat(fs.readdirSync(packageNodeModules))
    .filter(x => ['.bin'].indexOf(x) === -1)
    .reduce((externals, mod) => ({
      ...externals,
      [mod]: 'commonjs ' + mod,
    }), {});
}
module.exports = function externals(options) {
  if (options.target !== 'node') { return undefined; } // needs to be undefined or webpack config won't work
  return [nodeExternals()];  
};
