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
  if (options.target !== 'node') { return undefined; }
  return [nodeExternals()];
  // if (options.includeArangoImports) {
  //   return [/^@arangodb(\/.+)?$/];
  // }
  // const nodeModuleLibs = addNodeModules(options);
  // return [
  //   (_context, request, callback) => {
  //     if (/^@arangodb(\/.+)?$/.test(request)) { return callback(null, 'undefined'); }
  //     if (nodeModuleLibs[request]) { return callback(null, nodeModuleLibs[request]); }
  //     return callback();
  //   },
  // ];
};
