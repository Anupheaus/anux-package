const chalk = require('chalk');
const { logInfo } = require('./log');
const path = require('path');
const { getPackageJson, getPackageJsonAnuxSettings, shell, resolveFile, waitForAnyKeyToEnd } = require('./utils');
const fs = require('fs');
const rootPath = process.cwd();

async function removeDistFolder() {
  await shell('rm -rf dist');
}

module.exports = async function anuxHarness() {
  const { name, version } = getPackageJson({ throwErrorIfNotFound: true });
  const { build: { clearBeforeCompile } } = getPackageJsonAnuxSettings({ build: { clearBeforeCompile: true } });

  if (!fs.existsSync(path.resolve(rootPath, './harnesses.ts'))) throw new Error('There is no harnesses.ts file in the root of the project.');

  logInfo(`Starting harness for ${name} v${version}...`);
  logInfo(chalk`{black.bgYellowBright Press any key to end.}`);
  if (clearBeforeCompile) {
    logInfo('Clearing dist folder...');
    await removeDistFolder();
    logInfo('Cleared, continuing harness creation...');
  }
  const configFile = await resolveFile('configs/harness.webpack.config.js');
  const buildCommand = `npx webpack-dev-server --config ${configFile} --mode development`;
  const buildProcess = shell(buildCommand);
  buildProcess.catch(({ exitCode, stdout, stderr }) => {
    exitCode = exitCode == null ? 0 : exitCode;
    if (exitCode !== 0) {
      stderr = stderr === '' ? stdout : stderr;
      // eslint-disable-next-line no-console
      console.error(stderr);
    }
  });
  await waitForAnyKeyToEnd(async () => {
    logInfo('Shutting down harness...');
    await buildProcess.kill();
  });
};
