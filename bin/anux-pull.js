const { logInfo, logError } = require('./log');
const { query } = require('../configs/utils');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const glob = require('fast-glob');

const rootDir = process.cwd();

function getPackageJson(dir) {
  const packageJsonFile = path.resolve(dir, './package.json');
  if (!fs.existsSync(packageJsonFile)) { return; }
  return require(packageJsonFile);
}

function createWatcher(package, packageRootDir, isWatching) {
  return new Promise(resolve => {
    let isReady = false;
    const packageJson = getPackageJson(packageRootDir);
    if (!packageJson) { logError(`Unable to find the "package.json" file for "${package}".`); return; }
    const localRootDirsPattern = `${path.join(rootDir, './node_modules')}/**/${package}`.replace(/\\/g, '/');
    const localRootDirs = glob.sync(localRootDirsPattern, { absolute: true, onlyDirectories: true });

    const rootFiles = packageJson.files || ['dist'];
    const mandatoryFiles = [
      'package.json',
      'license.*', // TODO: This doesn't seem to be matching...?
      packageJson.main || '',
    ];

    const watchedItems = rootFiles.concat(mandatoryFiles)
      .filter(item => item != null)
      .map(file => path.join(packageRootDir, file));

    const watcher = chokidar.watch(watchedItems, {
      awaitWriteFinish: true,
    });

    const copyFile = file => {
      const relativeFile = path.relative(packageRootDir, file);
      localRootDirs.forEach(localRootDir => {
        const destFile = path.join(localRootDir, relativeFile);
        const destPath = path.dirname(destFile);
        if (!fs.existsSync(destPath)) { fs.mkdirSync(destPath); }
        if (fs.existsSync(destFile) && fs.statSync(destFile).mtime >= fs.statSync(file).mtime) { return; }
        fs.copyFileSync(file, destFile);
      });
      if (isReady) { logInfo(`\t${package}: Copied file "${relativeFile}"`); }
    };

    const removeFile = file => {
      const relativeFile = path.relative(packageRootDir, file);
      localRootDirs.forEach(localRootDir => {
        const destFile = path.join(localRootDir, relativeFile);
        if (!fs.existsSync(destFile)) { return; }
        fs.unlinkSync(destFile);
      });
      if (isReady) { logInfo(`\t${package}: Removed file "${relativeFile}"`); }
    };

    logInfo(`\t${isWatching ? 'Watching' : 'Copying'} files for package "${package}"`);
    watcher
      .on('add', copyFile)
      .on('change', copyFile)
      .on('unlink', removeFile)
      .on('ready', () => {
        isReady = true;
        resolve(watcher);
      });
  });
}

function stopWatcher(watcher) {
  if (!watcher) { return; }
  watcher.close();
}

module.exports = async (shouldWatchFiles) => {
  logInfo('Pulling in dependencies for this package...');
  const packageJson = getPackageJson(rootDir);
  if (!packageJson) { logError('Unable to find "package.json" for this package.'); return; }
  if (typeof (packageJson.pull) != 'object') { logError('There are no packages to pull for this package.'); return; }
  const watchers = await Promise.all(Object.keys(packageJson.pull).map(key => createWatcher(key, packageJson.pull[key], shouldWatchFiles)));
  if (shouldWatchFiles && watchers.every(watcher => watcher != null)) { await query('Press enter to stop...\n'); }
  watchers.map(stopWatcher);
};
