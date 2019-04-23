const fs = require('fs');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

function allNodeExternals(options) {
  if (!options.excludeNodeModules) { return []; }
  const config = {
    whitelist: options.includeExternals || [],
  };
  const externals = [nodeExternals(config)];
  const rootModules = path.resolve(options.root, '../../node_modules');
  if (fs.existsSync(rootModules)) { externals.push(nodeExternals({ ...config, modulesDir: rootModules })); }
  return externals;
};

module.exports = function externals(options) {
  return [
    ...allNodeExternals(options),
    ...(options.externals || []),
  ].filter(v => !!v);
};
