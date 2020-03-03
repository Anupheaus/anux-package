const path = require('path');
const { copyFile } = require('../bin/utils');
const rootPath = process.cwd();
const currentPath = __dirname;

module.exports = function () {
  copyFile(path.resolve(currentPath, 'gitignore'), path.resolve(rootPath, '.gitignore'), { silentFailIfExists: true });
};
