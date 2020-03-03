const path = require('path');
const { copyFile } = require('../bin/utils');
const rootPath = process.cwd();
const currentPath = __dirname;

module.exports = function () {
  copyFile(path.resolve(currentPath, '.eslintrc.js'), path.resolve(rootPath, '.eslintrc.js'));
};
