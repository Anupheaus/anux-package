const webpack = require('webpack');
const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const NotifierPlugin = require('webpack-build-notifier');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const chalk = require('chalk');
const NodemonPlugin = require('nodemon-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

function addCleanPlugin(options) {
  if (!options.cleanOutputPath) { return null; }
  return new CleanPlugin();
}

function addCSSExtraction(options, extractAppCSS, extractLibsCSS) {
  if (options.noCSS) { return [new webpack.NormalModuleReplacementPlugin(/\.(css|scss)$/, 'node-noop')]; }
  return [extractAppCSS, extractLibsCSS];
}

function addServerPlugins(options) {
  if (!(options.isServer || options.htmlTemplate)) { return []; }
  return [
    new HtmlWebPackPlugin({
      template: path.resolve(options.root, options.htmlTemplate),
      filename: path.resolve(options.outputPath, options.index),
      inject: 'head',
    }),
    options.isServer ? new webpack.HotModuleReplacementPlugin() : null,
  ];
}

function addNodemonPlugin(options) {
  if (options.useNodemon !== true) { return undefined; }
  return new NodemonPlugin();
}

function addCopyFilesPlugin(options) {
  if (options.copy.length === 0) { return null; }
  return new CopyPlugin(options.copy);
}

module.exports = function plugins(options, extractAppCSS, extractLibsCSS) {
  return [
    addCleanPlugin(options),
    new webpack.ProvidePlugin({
      React: 'react',
      ReactDOM: 'react-dom',
    }),
    new webpack.DefinePlugin(options.constants),
    ...addCSSExtraction(options, extractAppCSS, extractLibsCSS),
    new NotifierPlugin({
      title: options.title,
      suppressCompileStart: false,
      sound: !options.isWatching,
    }),
    addNodemonPlugin(options),
    ...addServerPlugins(options),
    addCopyFilesPlugin(options),
    new ProgressBarPlugin({
      format: chalk`  building {blueBright ${options.title}} [:bar] {green :percent}`,
    }),
    ...options.plugins,
  ].filter(item => !!item);
};
