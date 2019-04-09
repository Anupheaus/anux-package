const AutoPrefixerPlugin = require('autoprefixer');

module.exports = function module(options, extractAppCSS, extractLibsCSS) {
  const autoPrefixer = AutoPrefixerPlugin();
  return {
    rules: [
      {
        test: /\.scss$/,
        use: [
          'css-hot-loader',
          ...extractAppCSS.extract({
            fallback: 'style-loader',
            use: [
              { loader: 'css-loader', options: { sourceMap: true } },
              { loader: 'postcss-loader', options: { sourceMap: true, plugins: [autoPrefixer] } },
              { loader: 'sass-loader', options: { sourceMap: true, silent: true, quiet: true } },
            ],
          }),
        ],
      },
      {
        test: /\.pug$/,
        use: [
          'html-loader',
          'pug-html-loader'
        ]
      },
      {
        test: /\.css$/,
        loader: extractLibsCSS.extract({
          fallback: 'style-loader',
          use: [
            { loader: 'css-loader', options: { sourceMap: true } },
          ],
        }),
      },
      {
        test: /(?<!\.tests)\.tsx?$/,
        loader: 'ts-loader',
        options: {
          onlyCompileBundledFiles: true,
        },
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        loader: 'file-loader?name=fonts/[name].[ext]',
      },
      {
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre',
      },
    ],
  };
};
