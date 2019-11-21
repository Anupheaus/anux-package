const { shell, query, getPackageJson, writePackageJson } = require('./utils');
const { logInfo } = require('./log');

async function getLastPublishedVersion(name) {
  const result = await shell(`npm view ${name} version`, { stdout: false });
  return result.stdout.trim();
}

function bumpPackageVersion(packageJson) {
  const version = packageJson.version.split('.');
  version[2]++;
  packageJson.version = version.join('.');
  writePackageJson(packageJson);
  return packageJson.version;
}

// function ensureNoTestsHaveOnly() {

// }

module.exports = async function anuxPublish() {
  await query('Press any key if you have built the package:');
  const packageJson = getPackageJson();
  let { name, version } = packageJson;
  const lastVersion = await getLastPublishedVersion(name);
  if (lastVersion === version) { version = bumpPackageVersion(packageJson); }
  logInfo(`Publishing ${name} v${version}...`);
  await shell('npm publish');
}