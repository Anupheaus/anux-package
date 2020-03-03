const { shell, resolveFile, getPackageJson } = require('./utils');
const { logInfo } = require('./log');

module.exports = async function anuxTest() {
  const { name, version } = getPackageJson({ throwErrorIfNotFound: true });
  logInfo(`Testing package ${name} v${version}...`);
  const mochaConfigFile = await resolveFile('/configs/mocha.js');
  await shell(`sh ./node_modules/.bin/mocha --config ${mochaConfigFile}`);
}