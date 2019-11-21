const path = require('path');
const { shell } = require('./utils');
const rootDir = process.cwd();

module.exports = async function anuxLint(args) {
  let dir = args[0] || './src';
  dir = path.resolve(rootDir, dir);
  await shell(`npx eslint --ext .ts --ext .tsx --ext .js --ext .jsx --fix --color=true ${dir}`);
}