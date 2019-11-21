const path = require('path');
const { shell } = require('./utils');
const rootDir = process.cwd();

module.exports = async function anuxTest(args) {
  // let dir = args[0];
  // dir = path.resolve(rootDir, dir);
  // const anuxRoot = path.resolve(__dirname, '../');
  // const config = path.resolve(anuxRoot, './linters/eslint.js');
  // shell
  //   .cd(anuxRoot)
  //   .exec(`sh ./node_modules/.bin/eslint --ext .ts --ext .tsx --ext .js --ext .jsx --resolve-plugins-relative-to ${anuxRoot} -c ${config} ${dir}`);
}