const path = require('path');
const fs = require('fs');
const HtmlWebpackLoader = require('html-webpack-plugin');
const webpack = require('webpack');
const rootPath = process.cwd();
const getStandardConfig = require('./webpack.config');

const packageJsonPath = path.resolve(rootPath, 'package.json');
if (!fs.existsSync(packageJsonPath)) { throw new Error('Unable to find the package.json file for this package.'); }

const { name } = require(packageJsonPath);

module.exports = (env, args) => {
  const standardConfig = getStandardConfig(env, args);
  return {
    ...standardConfig,
    context: rootPath,
    entry: './harnesses.ts',
    target: 'web',
    output: undefined,
    module: {
      rules: [
        ...standardConfig.module.rules,
        {
          test: /\.pug$/,
          loader: 'pug-loader',
        },
      ],
    },
    externals: [], // include node_modules
    plugins: [
      ...standardConfig.plugins,
      new HtmlWebpackLoader({
        title: `${name} harness`,
        template: path.resolve(__dirname, '../harness/harness.pug'),
        inject: 'head',
      }),
      new webpack.DefinePlugin({
        PACKAGE_NAME: `"${name}"`,
      }),
    ],
    resolve: {
      ...standardConfig.resolve,
      modules: [path.resolve(rootPath, 'node_modules'), 'node_modules'],
      symlinks: false,
    },
    devServer: {
      port: 1234,
    },
  };
};
