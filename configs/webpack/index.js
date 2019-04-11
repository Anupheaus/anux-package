const path = require('path');
const callerId = require('caller-id');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');

process.traceDeprecation = true;

function getParam(name) {
  const indexOfParam = process.argv.findIndex(arg => arg.toLowerCase() === `--${name}`);
  return indexOfParam !== -1 ? process.argv[indexOfParam + 1] : null;
}

function extractCallerPath(data) {
  return path.dirname(data.filePath);
}

function applyDefaults(options) {
  return {
    title: 'Anux - Untitled Package',
    target: 'node',
    mode: 'development',
    configName: null,
    entry: {
      index: './src/index.ts',
    },
    outputPath: './dist/',
    aliases: null,
    cleanOutputPath: false,
    measureSpeed: false,
    isWatching: false,
    htmlTemplate: 'index.pug',
    index: 'index.html',
    port: 1234,
    appCSSFileName: '[name].css',
    constants: options.constants || {},
    embedCSS: false,
    noCSS: false,
    noMaps: false,
    includeArangoImports: false,
    plugins: [],
    isServer: process.argv.some(item => item.toLowerCase().includes('webpack-dev-server')),
    ...options,
    libraryTarget: options.target === 'node' ? 'commonjs2' : 'umd',
  };
}

function createCSSExtractors(options) {
  const extractAppCSS = new ExtractTextPlugin({
    allChunks: true,
    disable: options.embedCSS,
    filename: options.appCSSFileName,
  });
  const extractLibsCSS = new ExtractTextPlugin({
    allChunks: true,
    disable: options.embedCSS,
    filename: 'libs.css',
  });
  return { extractAppCSS, extractLibsCSS };
}

function createSingleConfig(options) {
  options = applyDefaults(options);

  if (options.configName === 'harness') { options = require('./configs/harness')(options); }

  if (options.outputPath == null) { throw new Error('The output path needs to be specified to create a valid webpack configuration.'); }
  if (options.noVendor) { options.separateVendor = false; }

  const { extractAppCSS, extractLibsCSS } = createCSSExtractors(options);
  const speedMeasure = new SpeedMeasurePlugin();

  const config = {
    context: options.root,
    entry: options.entry,
    mode: options.mode,
    devtool: options.noMaps ? false : 'source-map',
    target: options.target,
    output: {
      path: path.resolve(options.root, options.outputPath),
      filename: '[name].js',
      libraryTarget: options.libraryTarget,
      umdNamedDefine: true,
    },
    resolve: require('./resolve')(options),
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
}

/**
 * @typedef {object} Options
 * @property {string} title The title of this project.
 * @property {string} [target] Typically 'web' or 'node'. Default is 'node'.
 * @property {string} [mode] The mode of the compilation, either 'development' or 'production'. Default is 'development'.
 * @property {object} [entry] The entry file for this compilation. Default typically this is { index: './src/index.ts' }.
 * @property {string} [outputPath] The path where you want the output of the compilation to be saved to. Default is './dist/'.
 * @property {object} [aliases] A map object of aliases for imports. Default is null.
 * @property {boolean} [cleanOutputPath] Whether or not to clear the output path before writing the new compiled files to that location. Default is false.
 * @property {boolean} [measureSpeed] Whether or not to measure the speed of this configuration; mainly for debugging purposes. Default is false.
 * @property {boolean} [isWatching] Whether or not the files within this compilation are being watched. Default is false.
 * @property {string} [htmlTemplate] Default is 'index.pug'.
 * @property {string} [index] Default is 'index.html'.
 * @property {number} [port] Default is 1234.
 * @property {string} [appCSSFileName] Default is '[name].css'.
 * @property {object} [constants] Default is {}.
 * @property {boolean} [embedCSS] Default is false.
 * @property {boolean} [noCSS] Default is false.
 * @property {boolean} [noMaps] Default is false.
 * @property {boolean} [includeTests] Default is false.
 * @property {boolean} [isServer] Default is true if being executed with webpack-dev-server.
 */

/**
 * @param {Options | Options[]} options The options for creating this webpack configuration.
 */
module.exports = function createConfig(options) {
  const root = extractCallerPath(callerId.getData());
  const mode = getParam('mode');
  const configName = getParam('config-name');
  const isWatching = !!getParam('watch');

  if (!(options instanceof Array)) { options = [options]; }

  const configs = options.map(innerOptions => createSingleConfig({
    mode,
    root,
    configName,
    isWatching,
    ...innerOptions,
  }));

  return configs.length > 1 ? configs : configs[0];
};
