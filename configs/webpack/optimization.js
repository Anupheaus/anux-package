const TerserPlugin = require('terser-webpack-plugin');

module.exports = function optimization(options) {
  return {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        terserOptions: {
          compress: true,
          mangle: false,
          keep_classnames: true,
          keep_fnames: true,
        },
        sourceMap: true,
      }),
    ],
  };
};
