const setup = require('./test-setup');

/**
 * A function to configure Wallaby for your package.
 * @param {object} config The configuration settings for Wallaby
 * @param {string} config.name 
 * @param {boolean} config.enableReact
 */
module.exports = function (config) {
  config = {
    name: 'Anux - Unknown Package',
    enableReact: false,
    ...config || {},
  };
  return function () {
    return {
      name: config.name,
      files: [
        '!src/**/*.tests.ts?(x)',
        { pattern: 'src/**/harness.tsx', load: false, instrument: false },
        { pattern: 'src/**/*.ts?(x)', load: false },
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
      setup: eval('(function () { (' + setup.toString() + ')(' + JSON.stringify(config) + '); })'),
    };
  };
};
