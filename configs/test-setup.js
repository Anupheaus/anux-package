/**
 * @param {object} config
 * @param {string} config.name 
 * @param {boolean} config.enableReact
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

// mocha can't call the function so we have to do it for it
const config = process.env['test-config'] && JSON.parse(process.env['test-config']);
if (config) { setup(config); }

module.exports = setup;