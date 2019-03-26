const webpack = require('webpack');
const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const NotifierPlugin = require('webpack-build-notifier');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const chalk = require('chalk');

module.exports = function plugins(options, extractAppCSS, extractLibsCSS) {
  return [
    (options.cleanOutputPath ? new CleanPlugin() : null),
    new webpack.ProvidePlugin({
      React: 'react',
      ReactDOM: 'react-dom',
    }),
    new webpack.DefinePlugin(options.constants),
    ...(!options.noCSS ? [extractAppCSS, extractLibsCSS] :
      [new webpack.NormalModuleReplacementPlugin(/\.(css|scss)$/, 'node-noop')]),
    (!options.noMaps ? new webpack.SourceMapDevToolPlugin({
      filename: '[file].map',
      exclude: ['libs.js'],
    }) : null),
    new NotifierPlugin({
      title: options.title,
      suppressCompileStart: false,
      sound: !options.isWatching,
    }),
    ...(options.isServer ? [
      new HtmlWebPackPlugin({
        template: path.resolve(options.outputPath, options.htmlTemplate),
        filename: path.resolve(options.outputPath, options.index),
        inject: 'head',
      }),
      new webpack.HotModuleReplacementPlugin(),
    ] : []),
    new ProgressBarPlugin({
      format: chalk`  building {blueBright ${options.title}} [:bar] {green :percent}`,
    }),
  ].filter(item => !!item);
};
