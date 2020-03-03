const path = require('path');
const { logInfo } = require('./log');
const { resolveFile, getPackageJson } = require('./utils');

async function getInitFor(templateFile) {
  const initPath = await resolveFile(path.join('templates', `${templateFile}.init.js`));
  if (initPath) { return require(initPath); }
}

async function initTemplate(templateFile) {
  const init = await getInitFor(templateFile);
  if (!init) { throw new Error(`Unable to generate file ${templateFile}.`); }
  await init();
}

module.exports = async () => {
  const { name, version } = getPackageJson({ throwErrorIfNotFound: true });
  logInfo(`Initialising package: ${name} v${version}`);
  await initTemplate('.eslintrc');
  await initTemplate('wallaby');
  await initTemplate('gitignore');
  await initTemplate('tsconfig');
  logInfo('Finished initialising this package.');
};
