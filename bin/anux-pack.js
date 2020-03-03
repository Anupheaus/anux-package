const { logInfo } = require('./log');
const { packPackage, getPackageJson } = require('./utils');

module.exports = async () => {
  const { name, version } = getPackageJson({ throwErrorIfNotFound: true });
  logInfo(`Packing package: ${name} v${version}`);
  await packPackage(process.cwd());
  logInfo('Finished packing this package.');
};
