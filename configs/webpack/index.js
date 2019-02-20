const path = require('path');
const callerId = require('caller-id');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');

process.traceDeprecation = true;

function extractCallerPath(data) {
  return path.dirname(data.filePath);
}

function createSingleConfig(options) {
  options = {
    title: 'Anux - Untitled Package',
    target: 'web',
    mode: 'development',
    configName: null,
    entry: {
      index: './src/index.ts',
    },
    outputPath: './dist/',
    aliases: null,
    cleanOutputPath: false,
    measureSpeed: false,
    htmlTemplate: 'index.pug',
    index: 'index.html',
    port: 1234,
    appCSSFileName: '[name].css',
    constants: options.constants || {},
    embedCSS: false,
    noCSS: false,
    noMaps: false,
    includeArangoImports: false,
    includeTests: false,
    isServer: process.argv.some(item => item.toLowerCase().includes('webpack-dev-server')),
    ...options,
  };

  if (options.configName === 'harness') { options = require('configs/harness')(options); }

  if (options.outputPath == null) { throw new Error('The output path needs to be specified to create a valid webpack configuration.'); }
  if (options.noVendor) { options.separateVendor = false; }

  const extractAppCSS = new ExtractTextPlugin({
    filename: options.appCSSFileName,
    allChunks: true,
    disable: options.embedCSS,
  });
  const extractLibsCSS = new ExtractTextPlugin({
    filename: 'libs.css',
    allChunks: true,
    disable: options.embedCSS,
  });
  const speedMeasure = new SpeedMeasurePlugin();

  const config = {
    context: options.root,
    entry: options.entry,
    mode: options.mode === 'production' ? 'production' : 'development',
    devtool: false,
    target: options.target,
    output: {
      path: path.resolve(options.root, options.outputPath),
      filename: '[name].js',
      libraryTarget: options.target === 'node' ? 'commonjs2' : 'umd',
      umdNamedDefine: true,
    },
    resolve: require('./resolve')(options),
    resolveLoader: {
      modules: [path.resolve(options.root, './node_modules')],
    },
    externals: require('./externals')(options),
    module: require('./module')(options, extractAppCSS, extractLibsCSS),
    plugins: require('./plugins')(options, extractAppCSS, extractLibsCSS),
    stats: require('./stats')(options),
    optimization: require('./optimization')(options),
    devServer: require('./devserver')(options),
    node: {
      __dirname: true,
    },
  };
  return options.measureSpeed ? speedMeasure.wrap(config) : config;
};

module.exports = function createConfig(options) {
  const indexOfMode = process.argv.findIndex(arg => arg.toLowerCase() === '--mode');
  const mode = indexOfMode !== -1 ? process.argv[indexOfMode + 1] : undefined;

  const indexOfConfigName = process.argv.findIndex(arg => arg.toLowerCase() === '--config-name');
  const configName = indexOfConfigName !== -1 ? process.argv[indexOfConfigName + 1] : undefined;

  const root = extractCallerPath(callerId.getData());
  options = {
    ...options,
    root: options.root ? path.resolve(root, options.root) : root,
    configName,
    mode,
  };

  if (!(options instanceof Array)) { options = [options]; }

  const configs = options.map(createSingleConfig);
  return configs.length > 1 ? configs : configs[0];
};
