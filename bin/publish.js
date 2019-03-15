const fs = require('fs');
const path = require('path');
const runSteps = require('./steps');
const { log, chalk } = require('./log');
const packageJson = require('../package.json'); // require('../../../package.json');
const test = require('./test');
const git = require('./git');
const shell = require('./shell');

function findPackageJsonPath(root) {
  return path.resolve(root, './package.json');
}

function readPackageJson(path) {
  if (!fs.existsSync(path)) { return undefined; }
  return require(path);
}

function writePackageJson(path, content) {
  fs.writeFileSync(path, content);
}

/**
 * 
 * @param {string} version
 */
function separateVersion(version) {
  return version.split('.').map(v => Number.parseInt(v));
}

/**
 * @param {object} config
 * @param {string} config.root
 * @param {string[]} config.args
 */
module.exports = function (config) {
  config = {
    args: [],
    ...config,
  };
  const pathToPackageJson = findPackageJsonPath(config.root);
  const packageJson = readPackageJson(pathToPackageJson);
  if (!packageJson) { throw new Error('Unable to find the package.json file for this package.'); }
  const { name, version } = packageJson;
  let [major, minor, revision] = separateVersion(version);
  const tag = `${major}.${minor}.${revision}`;

  revision += 1;

  log(chalk`{greenBright \nPublishing ${name} v${tag}}\n\n`);
  runSteps([
    { title: 'Ensuring all changes are committed', action: () => !git.hasUncommittedChanges() },
    { title: 'Ensuring we are not on master branch', action: () => !git.isBranch('master') },
    { title: 'Building package', action: () => shell.exec(`yarn run build`) },
    { title: 'Executing tests', action: () => test(config), skipOn: '--skip-tests' },
    { title: 'Updating package.json version number', action: () => writePackageJson(pathToPackageJson, { ...packageJson, version: tag }) },
    { title: 'Committing and pushing final changes', action: [() => git.commit(`Updated to v${tag}`), () => git.push()] },
    { title: 'Publishing to NPM', action: () => shell.exec(`npm publish`) },
    { title: 'Merging to, tagging and pushing master branch', action: () => git.mergeInto('master', tag) },
  ], config.args);
}