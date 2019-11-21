const path = require('path');
const { logInfo } = require('./log');
const { resolveFile } = require('./utils');
const anuxInstall = require('./anux-install');

async function getGeneratorFor(templateFile) {
  const generatorPath = await resolveFile(path.join('templates', 'generator', `${templateFile}.js`));
  if (generatorPath) { return require(generatorPath); }
}

async function initTemplate(templateFile) {
  const generate = await getGeneratorFor(templateFile);
  if (!generate) { throw new Error(`Unable to generate file ${templateFile}.`); }
  await generate();
}

module.exports = async () => {
  await initTemplate('eslintrc');
  await initTemplate('wallaby');
  await initTemplate('gitignore');
  await initTemplate('tsconfig');
  await initTemplate('circleci');
  await anuxInstall();
  logInfo('Finished initialising and updating this package.');
};
