/* eslint-disable @typescript-eslint/camelcase */
const path = require('path');
const root = process.cwd();
const nodeExternals = require('webpack-node-externals');
const TerserPlugin = require('terser-webpack-plugin');
const { logInfo } = require('../bin/log');
const { getPackageJson, getPackageJsonAnuxSettings } = require('../bin/utils');

module.exports = (env, argv) => {
  const isDev = argv.mode === 'development';
  const useNodemon = argv.useNodemon === true;
  const { name } = getPackageJson({ throwErrorIfNotFound: true });
  let { build: { entry, includeNodeModules } } = getPackageJsonAnuxSettings({ build: { includeNodeModules: false } });

  if (includeNodeModules) {
    logInfo('NOTE: Including node modules in build output.');
  }

  if (entry) {
    logInfo('NOTE: Using custom entries.');
  } else {
    entry = { index: './src/index.ts' };
  }

  const result = {
    entry,
    devtool: 'source-map',
    target: 'node',
    output: {
      path: path.resolve(root, './dist'),
      libraryTarget: 'umd',
      library: name,
    },
    module: {
      rules: [{
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          onlyCompileBundledFiles: true,
          compilerOptions: {
            declaration: true,
            declarationDir: './dist',
            noEmit: false,
          },
        },
      }, {
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre'
      }],
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          cache: true,
          parallel: true,
          sourceMap: true,
          terserOptions: {
            compress: !isDev,
            keep_classnames: true,
            keep_fnames: true,
            mangle: !isDev,
            sourceMap: true,
          },
        }),
      ],
    },
    plugins: [
      useNodemon ? new (require('nodemon-webpack-plugin'))() : null,
    ].filter(item => item != null),
    externals: [
      includeNodeModules ? null : nodeExternals(),
    ].filter(item => !!item),
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    stats: {
      assets: false,
      builtAt: isDev,
      cached: false,
      cachedAssets: false,
      children: false,
      chunks: false,
      chunkGroups: false,
      chunkModules: false,
      chunkOrigins: false,
      colors: true,
      depth: false,
      entrypoints: false,
      env: false,
      errors: true,
      errorDetails: true,
      hash: false,
      logging: 'error',
      modules: false,
      outputPath: false,
      performance: true,
      providedExports: false,
      publicPath: false,
      reasons: false,
      source: false,
      timings: true,
      usedExports: false,
      version: false,
      warnings: false,
    },
  };
  // console.dir(result);
  return result;
};
