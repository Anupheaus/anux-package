const webpack = require('webpack');
const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const NotifierPlugin = require('webpack-build-notifier');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const chalk = require('chalk');

function addCleanPlugin(options) {
  if (!options.cleanOutputPath) { return null; }
  return new CleanPlugin();
}

function addCSSExtraction(options, extractAppCSS, extractLibsCSS) {
  if (options.noCSS) { return [new webpack.NormalModuleReplacementPlugin(/\.(css|scss)$/, 'node-noop')]; }
  return [extractAppCSS, extractLibsCSS];
}

function addSourceMaps(options) {
  if (options.noMaps) { return null; }
  return new webpack.SourceMapDevToolPlugin({
    filename: '[file].map',
    exclude: ['libs.js'],
  });
}

function addServerPlugins(options) {
  if (!options.isServer) { return []; }
  return [
    new HtmlWebPackPlugin({
      template: path.resolve(options.outputPath, options.htmlTemplate),
      filename: path.resolve(options.outputPath, options.index),
      inject: 'head',
    }),
    new webpack.HotModuleReplacementPlugin(),
  ];
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
    addSourceMaps(options),
    new NotifierPlugin({
      title: options.title,
      suppressCompileStart: false,
      sound: !options.isWatching,
    }),
    ...addServerPlugins(options),
    new ProgressBarPlugin({
      format: chalk`  building {blueBright ${options.title}} [:bar] {green :percent}`,
    }),
  ].filter(item => !!item);
};
