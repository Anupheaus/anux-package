const TerserPlugin = require('terser-webpack-plugin');

module.exports = function optimization(options) {
  return {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        terserOptions: {
          compress: true,
          keep_classnames: true,
          keep_fnames: true,
        },
        sourceMap: true,
      }),
    ],
    // ...(options.target === 'web' ? {
    //   splitChunks: {
    //     cacheGroups: {
    //       commons: {
    //         test: /[\\/]node_modules[\\/]/,
    //         name: "libs",
    //         chunks: "all",
    //       },
    //     },
    //   },
    // } : null),
  };
}
