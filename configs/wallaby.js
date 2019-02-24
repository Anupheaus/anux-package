/**
 * @typedef {Object} Config
 * @property {string} name 
 * @property {boolean} enableReact
 */

function setup(config) {
  try { require('anux-common'); } catch (error) { }
  const chai = require('chai');
  const spies = require('chai-spies');
  const fuzzy = require('chai-fuzzy');

  chai.use(spies);
  chai.use(fuzzy);

  global['chai'] = chai;
  global['expect'] = chai.expect;

  if (config.enableReact) {
    const jsdom = require('jsdom');
    const dom = new jsdom.JSDOM('<!doctype html><html><body></body></html>');
    const enzyme = require('enzyme');
    const React = require('react');
    const enzymeAdapter = require('enzyme-adapter-react-16');

    global['React'] = React;
    global['document'] = dom.window.document;
    global['window'] = dom.window;
    global.navigator = {
      userAgent: 'node.js',
    };

    enzyme.configure({ adapter: new enzymeAdapter() });
  }
}

/**
 * A function to configure Wallaby for your package.
 * @param {Config} config The configuration settings for Wallaby
 */
module.exports = function (config) {
  config = {
    name: 'Anux - Unknown Package',
    enableReact: false,
    ...config || {},
  }
  return function () {
    return {
      name: config.name,
      files: [
        '!src/**/*.tests.ts?(x)',
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
}
