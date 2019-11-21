const path = require('path');
const fs = require('fs');
const setup = require('./test-setup');
const root = process.cwd();

/**
 * A function to configure Wallaby for your package.
 * @param {object} config The configuration settings for Wallaby
 * @param {string} config.name 
 * @param {boolean} config.enableReact
 * @param {object[]} config.include
 */
module.exports = function (config) {
  const packageJsonPath = path.resolve(root, 'package.json');
  if (!fs.existsSync(packageJsonPath)) { throw new Error('Unable to find package.json file for this package.'); }
  const { name } = require(packageJsonPath);
  config = {
    name,
    include: [],
    ...config,
  };
  return function () {
    return {
      name: config.name,
      files: [
        { pattern: 'package.json', load: false },
        '!src/**/*.tests.ts?(x)',
        { pattern: 'src/**/*.ts?(x)', load: false },
        ...config.include,
      ],
      tests: [
        { pattern: 'src/**/*.tests.ts?(x)' },
      ],
      testFramework: 'mocha',
      env: {
        type: 'node',
      },
      workers: {
        initial: 6,
        regular: 3,
      },
      debug: true,
      setup: eval('(function () { (' + setup.toString() + ')(' + JSON.stringify(config) + '); })'),
    };
  };
};
