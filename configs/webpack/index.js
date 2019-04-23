const path = require('path');
const callerId = require('caller-id');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');

process.traceDeprecation = true;

function getParam(name) {
  const indexOfParam = process.argv.findIndex(arg => arg.toLowerCase() === `--${name}`);
  if (process.argv.length - 1 === indexOfParam) { return true; }
  return indexOfParam !== -1 ? process.argv[indexOfParam + 1] : null;
}

function extractCallerPath(data) {
  return path.dirname(data.filePath);
}

function applyDefaults(options) {
  options.target = options.target || 'library';
  return {
    title: 'Anux - Untitled Package',
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
    htmlTemplate: undefined,
    index: 'index.html',
    port: 1234,
    appCSSFileName: '[name].css',
    excludeNodeModules: options.target === 'node' || options.target === 'library',
    constants: {},
    embedCSS: false,
    copy: [],
    noCSS: options.target === 'node',
    noMaps: options.target === 'node',
    useNodemon: options.isWatching && options.target === 'node',
    includeExternals: [],
    disableNotificationWhenWatching: false,
    externals: [],
    plugins: [],
    isServer: process.argv.some(item => item.toLowerCase().includes('webpack-dev-server')),
    libraryTarget: options.target === 'node' || options.target === 'library' ? 'commonjs2' : 'umd',
    ...options,
    node: {
      __dirname: true,
      ...(options.node || {})
    },
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
    target: ['node', 'library'].includes(options.target) ? 'node' : 'web',
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
    node: options.node,
  };
  return options.measureSpeed ? speedMeasure.wrap(config) : config;
}

/**
 * @typedef {object} FromTo
 * @property {string} from The location where the file is to be taken from
 * @property {string} to The location where the file is to be written to in the output directory.
 */

/**
 * @typedef {object} Options
 * @property {string} title The title of this project.
 * @property {string} [target] One of 'web', 'library' or 'node'. Default is 'library'.
 * @property {string} [mode] The mode of the compilation, either 'development' or 'production'. Default is 'development'.
 * @property {object} [entry] The entry file for this compilation. Default typically this is { index: './src/index.ts' }.
 * @property {string} [outputPath] The path where you want the output of the compilation to be saved to. Default is './dist/'.
 * @property {object} [aliases] A map object of aliases for imports. Default is null.
 * @property {boolean} [cleanOutputPath] Whether or not to clear the output path before writing the new compiled files to that location. Default is false.
 * @property {boolean} [measureSpeed] Whether or not to measure the speed of this configuration; mainly for debugging purposes. Default is false.
 * @property {boolean} [isWatching] Whether or not the files within this compilation are being watched. Default is false.
 * @property {string} [htmlTemplate] Default is undefined.
 * @property {string} [index] Default is 'index.html'.
 * @property {number} [port] Default is 1234.
 * @property {string} [appCSSFileName] Default is '[name].css'.
 * @property {object} [constants] Default is {}.
 * @property {boolean} [embedCSS] Default is false.
 * @property {(string | Regex)[]} [includeExternals] An array of externals to be included in the bundle. Default is [].
 * @property {boolean} [useNodemon] Enable or disable the use of Nodemon after bundling.  Default is enabled when targeting node and watching for changes.
 * @property {boolean} [noCSS] Default is false.
 * @property {boolean} [disableNotificationWhenWatching] Whether or not to show a notification on compiling and build completion when watching for changes.  Default is false.
 * @property {boolean} [noMaps] Default is false.
 * @property {boolean} [includeTests] Default is false.
 * @property {boolean} [isServer] Default is true if being executed with webpack-dev-server.
 * @property {FromTo[]} [copy] Copies files from the location given to the dist folder
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
