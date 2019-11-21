const chalk = require('chalk');
const { logInfo } = require('./log');
const { getPackageJson, waitForAnyKeyToEnd } = require('./utils');
const anuxBuild = require('./anux-build');

module.exports = async function anuxStart() {
  const { name, version } = getPackageJson({ throwErrorIfNotFound: true });

  logInfo(`Starting ${name} v${version}...`);
  logInfo(chalk`{black.bgYellowBright Press any key to end.}`);
  const buildProcess = anuxBuild(['dev', 'non-interactive', 'use-nodemon']);
  await waitForAnyKeyToEnd(async () => {
    logInfo('Shutting down...');
    await buildProcess.kill();
  });
};
