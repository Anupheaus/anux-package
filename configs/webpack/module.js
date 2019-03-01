module.exports = function module(options, extractAppCSS, extractLibsCSS) {
  return {
    rules: [
      {
        test: /\.scss$/,
        use: [
          'css-hot-loader',
          ...extractAppCSS.extract({
            fallback: 'style-loader',
            use: [
              { loader: 'css-loader', query: { sourceMap: true } },
              { loader: 'postcss-loader', query: { sourceMaps: true } },
              { loader: 'sass-loader', query: { sourceMaps: true, silent: true, quiet: true } },
            ],
          }),
        ],
      },
      {
        test: /\.pug$/,
        use: [
          "html-loader",
          "pug-html-loader"
        ]
      },
      {
        test: /\.css$/,
        loader: extractLibsCSS.extract({
          fallback: 'style-loader',
          use: [
            { loader: 'css-loader' },
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
    ],
  };
};
