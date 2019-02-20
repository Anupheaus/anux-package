const path = require('path');

module.exports = function devServer(options) {
  return {
    contentBase: path.resolve(options.outputPath),
    compress: true,
    hot: true,
    index: options.index,
    port: options.port,
    stats: require('./stats')(options),
  };
};
