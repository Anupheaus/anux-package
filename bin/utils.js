const path = require('path');
const readline = require('readline');
const fs = require('fs');
const childProcess = require('child_process');
const Transform = require('stream').Transform;
const util = require('util');
const kill = require('tree-kill');
const chalk = require('chalk');
const glob = require('fast-glob');
const deepMerge = require('merge-deep');
const { logWarn } = require('./log');
const root = process.cwd();

function writeTemplateByPackageType(packageType, templateName) {
  const generator = require(path.resolve(__dirname, '../templates/generator', `./${templateName}.js`));
  return generator(packageType);
}

function end(exitCode = 0) { process.exit(exitCode); }

function query(message) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(message, resolve));
}

function getPackageJson({ throwErrorIfNotFound = false, packagePath = root } = {}) {
  const packageJsonPath = path.resolve(packagePath, './package.json');
  if (!fs.existsSync(packageJsonPath)) {
    if (throwErrorIfNotFound) { throw new Error('Unable to find a package.json file at this location.'); }
    return;
  }
  return { ...require(packageJsonPath) }; // Make a clone of this so that we aren't modifying what is in the require cache
}

function writePackageJson(packageJson, packagePath) {
  packagePath = packagePath || root;
  const packageJsonFileName = path.resolve(packagePath, './package.json');
  const currentPackageJson = getPackageJson({ packagePath });
  const stringifiedNewPackageJson = JSON.stringify(packageJson, null, 2);
  const stringifiedCurrentPackageJson = JSON.stringify(currentPackageJson, null, 2);
  if (stringifiedNewPackageJson === stringifiedCurrentPackageJson) { return; }
  fs.writeFileSync(packageJsonFileName, stringifiedNewPackageJson);
}

function getPackageJsonAnuxSettings(defaults, packagePath) {
  const { anux } = getPackageJson({ packagePath });
  return deepMerge(defaults, anux || {});
}


let cachedIdentifiedPackage;
function identifyAnuxPackage(packageJson) {
  let identifiedPackage = packageJson ? undefined : cachedIdentifiedPackage;
  if (!identifiedPackage) {
    const anuxPackageRegex = /anux(-\S+)?-package/gi;
    const { name, devDependencies, dependencies } = (packageJson || getPackageJson());
    const allDependencies = Object.keys({ ...(dependencies || {}), ...(devDependencies || {}) });
    anuxPackageRegex.lastIndex = 0;
    identifiedPackage = allDependencies.find(dependency => anuxPackageRegex.test(dependency));
    anuxPackageRegex.lastIndex = 0;
    if (!identifiedPackage && anuxPackageRegex.test(name)) { identifiedPackage = name; }
    if (!packageJson) { cachedIdentifiedPackage = identifiedPackage; }
  }
  return identifiedPackage;
}

function hasDependency(name) {
  const { dependencies, devDependencies } = getPackageJson();
  return dependencies[name] || devDependencies[name];
}

let cachedRootPath;
function getAnuxPath(subPath) {
  if (!cachedRootPath) {
    const packageRoot = identifyAnuxPackage();
    if (!packageRoot) { throw new Error('Unable to determine the anux package root.'); }
    cachedRootPath = path.resolve(root, 'node_modules', packageRoot);
  }
  if (subPath) {
    return path.resolve(cachedRootPath, subPath);
  } else {
    return cachedRootPath;
  }
}

async function resolveFile(file) {
  let packageJson = getPackageJson();
  const localPath = path.resolve(root, file)
  if (fs.existsSync(localPath)) { return localPath; }
  let currentAnuxPackage;
  const nodeModuleRoot = path.join(root, 'node_modules');
  do {
    currentAnuxPackage = identifyAnuxPackage(packageJson)
    if (currentAnuxPackage) {
      const attempts = 1;
      while (true) { // eslint-disable-line no-constant-condition
        const anuxPackagePaths = await glob(`**/${currentAnuxPackage}`, { cwd: nodeModuleRoot, onlyDirectories: true, absolute: true, followSymbolicLinks: true });
        if (anuxPackagePaths.length === 0) {
          if (attempts < 2) {
            logWarn(`Warning: Unable to find ${currentAnuxPackage} within the node modules for this package, attempting to link this package now...`);
            await shell(`npm link ${currentAnuxPackage}`); // eslint-disable-line @typescript-eslint/no-use-before-define
            continue;
          } else {
            throw new Error(`Unable to link the ${currentAnuxPackage} package, please ensure this package is linkable and then try again.`);
          }
        }
        const anuxPackagePath = anuxPackagePaths[0]
        const filePath = path.resolve(anuxPackagePath, file);
        if (fs.existsSync(filePath)) { return filePath; }
        packageJson = require(path.resolve(anuxPackagePath, 'package.json'));
        break;
      }
    }
  } while (currentAnuxPackage);
  return undefined;
}

function ModifyStream(prefix) {
  if (!(this instanceof ModifyStream)) { return new ModifyStream(prefix); }
  this.prefix = prefix;
  Transform.call(this, { decodeStrings: false });
}

util.inherits(ModifyStream, Transform);

ModifyStream.prototype._transform = function (chunk, encoding, done) {
  /** @type string **/
  let data = (encoding === 'utf8' ? chunk : chunk.toString());
  if (data.charCodeAt(0) === 13 && data.charCodeAt(1) === 10) { data = data.substr(2); }
  done(null, chalk`{black.bgBlueBright ${this.prefix}} ${data}`);
};

function shell(command, options = {}) {
  const { prefix, cwd, stdout } = {
    prefix: '',
    cwd: undefined,
    stdout: true,
    ...options,
  }
  const env = { ...process.env };
  env.FORCE_COLOR = 1;
  const commandProcess = childProcess.exec(command, { async: true, env, cwd });
  const lines = [];
  const errorLines = [];
  commandProcess.stdout.on('data', line => {
    if (stdout) { console.log(line); }
    lines.push(line.toString());
    while (lines.length > 500) { lines.shift(); }
  });
  commandProcess.stderr.on('data', line => {
    if (stdout) { console.error(line); }
    errorLines.push(line.toString());
    while (errorLines.length > 500) { errorLines.shift(); }
  });
  const promise = new Promise((resolve, reject) => commandProcess.on('exit', exitCode => {
    exitCode = exitCode == null ? 0 : exitCode;
    if (exitCode === 0) {
      resolve({ exitCode, stdout: lines.join('') });
    } else {
      reject({ exitCode, stdout: lines.join(''), stderr: errorLines.join('') });
    }
  }));
  promise.kill = async () => {
    await new Promise((resolve, reject) => kill(commandProcess.pid, error => error ? reject(error) : resolve()));
    await promise;
  };
  return promise;
}

function getArg(args, argName, hasValue, defaultValue) {
  hasValue = hasValue === true;
  argName = argName.toLowerCase()
  const indexOfArg = args.findIndex(arg => argName === arg.toLowerCase());
  if (!hasValue) { return indexOfArg >= 0; }
  if (indexOfArg === args.length - 1) { return defaultValue === undefined ? true : defaultValue; }
  return args[indexOfArg + 1];
}

function getLastModifiedDateOf(file) {
  if (!fs.existsSync(file)) { return -1; }
  const stats = fs.statSync(file);
  return stats.mtime;
}

function copyFile(source, dest) {
  if (!fs.existsSync(source)) { throw new Error(`Unable to find the source file to copy (source: ${source}).`); }
  if (!fs.existsSync(path.dirname(dest))) { fs.mkdirSync(path.dirname(dest), { recursive: true }); }
  fs.copyFileSync(source, dest);
}

let isShuttingDown = false;
async function waitForAnyKeyToEnd(delegate) {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const attachOrDetachFromProcessSignals = isAttaching => ['SIGINT', 'SIGTERM'].forEach(signal => process[isAttaching ? 'on' : 'off'](signal, endProcess));
  const endProcess = async () => {
    if (isShuttingDown) { return; }
    isShuttingDown = true;
    attachOrDetachFromProcessSignals(false);
    await delegate();
  };

  attachOrDetachFromProcessSignals(true);
  await query('');
  endProcess();
}

module.exports = {
  end,
  query,
  getPackageJson,
  writePackageJson,
  getPackageJsonAnuxSettings,
  getAnuxPath,
  resolveFile,
  hasDependency,
  writeTemplateByPackageType,
  shell,
  getArg,
  getLastModifiedDateOf,
  copyFile,
  waitForAnyKeyToEnd,
}