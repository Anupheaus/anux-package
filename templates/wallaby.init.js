const path = require('path');
const { copyFile } = require('../bin/utils');
const rootPath = process.cwd();
const currentPath = __dirname;

module.exports = function () {
  copyFile(path.resolve(currentPath, 'wallaby.js'), path.resolve(rootPath, 'wallaby.js'), { silentFailIfExists: true });
};
