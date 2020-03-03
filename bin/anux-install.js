const path = require('path');
const fs = require('fs');
// const glob = require('fast-glob');
const { getPackageJson, writePackageJson, shell, copyFile, end, getArg } = require('./utils');
const { logInfo } = require('./log');

const root = process.cwd();

function sortDependencies(target, depsName) {
  if (!target[depsName]) { return; }
  const deps = target[depsName];
  target[depsName] = Object.keys(deps)
    .map(name => ({ name, version: deps[name] }))
    .sort((a, b) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0)
    .reduce((newDeps, { name, version }) => ({
      ...newDeps,
      [name]: version,
    }), {});
}

function sortAllDependencies(targetPackageJson) {
  sortDependencies(targetPackageJson, 'dependencies');
  sortDependencies(targetPackageJson, 'devDependencies');
  sortDependencies(targetPackageJson, 'peerDependencies');
}

async function createTarballOf(packagePath, packageJson) {
  const tarballFileName = path.resolve(packagePath, 'package.tgz');
  const packageJsonFileName = path.resolve(packagePath, 'package.json');
  if (!fs.existsSync(packageJsonFileName)) { throw new Error(`Unable to find the package json file at this location: "${packagePath}`); }
  // const lastModifiedDateOfTarball = getLastModifiedDateOf(tarballFileName);
  // const lastModifiedDateOfPackageJson = getLastModifiedDateOf(packageJsonFileName);
  // if (lastModifiedDateOfTarball > lastModifiedDateOfPackageJson) { return tarballFileName; }
  const { name } = packageJson || getPackageJson({ packagePath });
  logInfo(`Creating tarball of ${name}...`);
  const result = await shell('npm pack --loglevel error', { cwd: packagePath, stdout: false });
  const sourceTarballFileName = path.resolve(packagePath, result.stdout.trim());
  copyFile(sourceTarballFileName, tarballFileName);
  fs.unlinkSync(sourceTarballFileName);
  return tarballFileName;
}

async function loopThroughLinksFrom(packageJson, delegate) {
  const links = packageJson['links'] || packageJson['link'] || {};
  for (const name of Object.keys(links)) {
    const linkPath = links[name];
    await delegate(name, linkPath);
  }
}

async function makeTarballsOfLinks(tarballPackages) {
  await Promise.all(tarballPackages.map(({ packagePath }) => createTarballOf(packagePath)));
}

async function getTarballsOfLinks(packagePath, packageJson) {
  const tarballPackages = [];
  packageJson = packageJson || getPackageJson({ packagePath });
  await loopThroughLinksFrom(packageJson, async (name, linkPath) => {
    const resolvedLinkPath = path.resolve(packagePath, linkPath);
    if (!fs.existsSync(resolvedLinkPath)) { throw new Error(`Unable to install as the link for ${name} was invalid: ${linkPath} (resolves to: ${resolvedLinkPath})`); }
    const tarballFileName = path.join(resolvedLinkPath, './package.tgz');
    tarballPackages.push(...(await getTarballsOfLinks(resolvedLinkPath)));
    tarballPackages.push({ packagePath: resolvedLinkPath.toLowerCase(), tarballFileName, name, parentPackages: [packagePath.toLowerCase()] });
  });
  return tarballPackages;
}

/**
 * 
 * @param {any[]} tarballPackages 
 */
function removeDuplicatesFromTarballPackages(tarballPackages) {
  for (let index = tarballPackages.length - 1; index >= 0; index--) {
    const package = tarballPackages[index];
    const foundIndex = tarballPackages.findIndex(item => item.packagePath === package.packagePath);
    if (foundIndex === index) continue;
    const { parentPackages } = tarballPackages[foundIndex];
    tarballPackages.splice(index, 1);
    package.parentPackages.forEach(parentPackage => {
      if (parentPackages.includes(parentPackage)) return;
      parentPackages.push(parentPackage);
    });
  }
}

/**
 * 
 * @param {any[]} tarballPackages 
 */
function updatePackagesWithTarballLinks(tarballPackages) {
  const updates = {};
  tarballPackages.forEach(({ name, tarballFileName, parentPackages }) => parentPackages.forEach(parentPackage => {
    updates[parentPackage] = (updates[parentPackage] || []);
    updates[parentPackage].push({ name, tarballFileName });
  }));
  Object.entries(updates).forEach(([packagePath, details]) => {
    const packageJson = getPackageJson({ packagePath, throwErrorIfNotFound: true });
    sortAllDependencies(packageJson);
    details.forEach(({ name, tarballFileName }) => {
      ['dependencies', 'devDependencies'].forEach(location => {
        if (packageJson[location][name]) packageJson[location][name] = `file:${tarballFileName}`;
      });
    });
    writePackageJson(packageJson, packagePath);
  });
}

async function doInstall() {
  logInfo('Installing dependencies...');
  return shell('npm install --loglevel=error --color always');
}

async function removeLinksFromNodeModules(packagePath, packageJson) {
  packageJson = packageJson || getPackageJson({ packagePath });
  await loopThroughLinksFrom(packageJson, async name => {
    const nodeModulesLinkPath = path.resolve(packagePath, 'node_modules', name);
    if (!fs.existsSync(nodeModulesLinkPath)) { return; }
    await shell(`rm -rf ${nodeModulesLinkPath}`);
  });
}

// async function createSymlinksForLinks(packageJson) {
//   const mandatoryFiles = [
//     'package.json',
//   ];
//   const globRoot = path.resolve(root, 'node_modules');
//   return loopThroughLinksFrom(packageJson, async (name, linkPath) => {
//     logInfo(`Linking ${name} package...`);
//     linkPath = path.resolve(root, linkPath);
//     const linkPackageJson = require(path.resolve(linkPath, 'package.json'));
//     const rootFiles = linkPackageJson.files || ['dist'];
//     const allFiles = rootFiles.concat(mandatoryFiles);
//     const globPattern = `./**/${name}`;
//     const linkLocations = await glob(globPattern, { cwd: globRoot, onlyDirectories: true, absolute: true });
//     await Promise.all(linkLocations.map(linkLocation => Promise.all(allFiles.map(async fileOrPath => {
//       const localFileOrPath = path.resolve(linkLocation, fileOrPath);
//       const linkFileOrPath = path.resolve(linkPath, fileOrPath);
//       if (fs.existsSync(localFileOrPath)) {
//         if (fs.realpathSync(localFileOrPath) !== localFileOrPath) { return; }
//         await shell(`rm -rf ${localFileOrPath}`, { stdout: false });
//       }
//       if (fs.statSync(linkFileOrPath).isDirectory()) {
//         fs.symlinkSync(linkFileOrPath, localFileOrPath, 'junction');
//       } else {
//         fs.symlinkSync(linkFileOrPath, localFileOrPath, 'file');
//       }
//     }))));
//   });
// }

module.exports = async function anuxInstall() {
  const packOnlyInstall = getArg(process.argv, '--pack-only', false, false)
  logInfo(`Installing...${packOnlyInstall ? ' (pack only)' : ''}`);
  const packageJson = getPackageJson();
  sortAllDependencies(packageJson);
  const tarballPackages = await getTarballsOfLinks(root, packageJson);
  removeDuplicatesFromTarballPackages(tarballPackages);
  makeTarballsOfLinks(tarballPackages);
  updatePackagesWithTarballLinks(tarballPackages);
  await removeLinksFromNodeModules(root, packageJson);
  writePackageJson(packageJson);
  if (packOnlyInstall === true) { return; }
  try {
    await doInstall();
  } catch ({ exitCode, stderr }) {
    // eslint-disable-next-line no-console
    console.error(stderr);
    end(1);
  }
  // await createSymlinksForLinks(packageJson);
  logInfo('Finished installing.');
};
