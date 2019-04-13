const nodeExternals = require('webpack-node-externals');

// function nodeExternals(context, request, callback) {
//   var moduleName = context.toLowerCase();
//   if (moduleName.includes('node_modules')) {
//     callback(null, `commonjs ${request}`);
//   } else {
//     callback();
//   }
// };

module.exports = function externals(options) {
  return [
    options.excludeNodeModules ? nodeExternals() : null,
    ...(options.externals || []),
  ].filter(v => !!v);
};
