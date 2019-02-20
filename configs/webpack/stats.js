module.exports = function stats(options) {
  return {
    errors: true,
    timings: true,
    assets: false,
    cached: false,
    cachedAssets: false,
    children: false,
    chunks: true,
    chunkModules: false,
    chunkOrigins: false,
    colors: true,
    hash: false,
    modules: false,
    moduleTrace: false,
    performance: false,
    publicPath: false,
    reasons: false,
    source: false,
    version: false,
    warnings: false,
  };
};