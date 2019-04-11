function nodeExternals(context, request, callback) {
  var moduleName = context.toLowerCase();
  if (moduleName.includes('node_modules')) {
    callback(null, `commonjs ${request}`);
  } else {
    callback();
  }
};

module.exports = function externals(options) {
  if (options.target !== 'node') { return undefined; } // needs to be undefined or webpack config won't work
  return [
    nodeExternals, 
    ...(options.externals || []),
  ];
};
