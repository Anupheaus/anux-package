const path = require('path');

module.exports = function (options) {
  return {
    ...options,
    title: `${options.title} - Harness`,
    entry: {
      index: path.resolve(__dirname, '../../../harness/harness.tsx'),
    },
    target: 'web',
    outputPath: path.resolve(__dirname, '../../../harness'),
    htmlTemplate: path.resolve(__dirname, '../../../harness/harness.pug'),
    index: './harness.html',
    appCSSFileName: './index.css',
    cleanOutputPath: false,
    isWatching: true,
  };
};
