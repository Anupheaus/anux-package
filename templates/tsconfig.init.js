const path = require('path');
const { copyFile } = require('../bin/utils');
const rootPath = process.cwd();
const currentPath = __dirname;

module.exports = function () {
  copyFile(path.resolve(currentPath, 'tsconfig.json'), path.resolve(rootPath, 'tsconfig.json'), { silentFailIfExists: true });
};
