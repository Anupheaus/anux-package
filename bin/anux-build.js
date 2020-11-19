const { logInfo } = require('./log');
const { getPackageJson, getPackageJsonAnuxSettings, shell, getArg, resolveFile, waitForAnyKeyToEnd } = require('./utils');

function getArgs(args) {
  const isDev = getArg(args, 'dev', false);
  const nonInteractive = getArg(args, 'non-interactive', false);
  const useNodemon = getArg(args, 'use-nodemon', false);
  args = args.filter(arg => !['dev', 'non-interactive', 'use-nodemon'].includes(arg.toLowerCase())); // remove all known args

  return { isDev, nonInteractive, useNodemon };
}

async function removeDistFolder() {
  await shell('rm -rf dist');
}

module.exports = function anuxBuild(args) {
  const { isDev, nonInteractive, useNodemon } = getArgs(args);
  let buildProcess = null;

  const endBuild = async () => {
    if (!nonInteractive) { logInfo('Shutting down build watcher...'); }
    await buildProcess.kill();
  };

  const promise = (async () => {
    const { name, version } = getPackageJson({ throwErrorIfNotFound: true });
    const { build: { clearBeforeCompile } } = getPackageJsonAnuxSettings({ build: { clearBeforeCompile: true } });

    logInfo(`Building the ${isDev ? 'development' : 'production'} version of ${name} v${version}...`);
    if (clearBeforeCompile) {
      logInfo('Clearing dist folder...');
      await removeDistFolder();
      logInfo('Cleared, continuing build process...');
    }
    const configFile = await resolveFile('configs/webpack.config.js');
    const buildCommand = `npx webpack --config ${configFile} ${isDev ? '--mode development --watch' : '--mode production'} ${useNodemon ? '--env useNodemon' : ''}`;
    buildProcess = shell(buildCommand);
    buildProcess.catch(({ exitCode, stdout, stderr }) => {
      exitCode = exitCode == null ? 0 : exitCode;
      if (exitCode !== 0) {
        stderr = stderr === '' ? stdout : stderr;
        // eslint-disable-next-line no-console
        console.error(stderr);
      }
    });
    if (isDev) {
      if (!nonInteractive) { await waitForAnyKeyToEnd(endBuild); }
    } else {
      await buildProcess;
      logInfo('Building completed successfully.');
    }
  })();
  promise.kill = endBuild;
  return promise;
};
