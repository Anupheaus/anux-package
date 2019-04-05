/**
 * @param {object} config
 * @param {boolean} config.enableReact
 * @param {string} config.root
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
    const { JSDOM } = require('jsdom');
    const { window } = new JSDOM('<!doctype html><html><body></body></html>', {
      pretendToBeVisual: false,
      userAgent: 'mocha',
    });
    const React = require('react');
    const enzyme = require('enzyme');
    const Adapter = require('enzyme-adapter-react-16');

    global['React'] = React;
    global['window'] = window;
    global['document'] = window.document;
    global['navigator'] = window.navigator;
    global['enzyme'] = enzyme;

    const readWriteNumericProperty = {
      value: 0,
      enumerable: true,
      configurable: true,
      writable: true,
    };

    // set HTMLElement properties to be read-write
    Object.defineProperties(window.HTMLElement.prototype, {
      clientWidth: readWriteNumericProperty,
      clientHeight: readWriteNumericProperty,
      scrollWidth: readWriteNumericProperty,
      scrollHeight: readWriteNumericProperty,
    });

    // mock the resize observer
    window['ResizeObserver'] = function (delegate) {
      window['resizeObserver'] = this;
      this.observe = () => void 0;
      this.unobserve = () => void 0;
      this.triggerWith = entries => delegate(entries);
    }

    enzyme.configure({ adapter: new Adapter() });
  }
}

// mocha can't call the function so we have to do it for it
const config = process.env['test-config'] && JSON.parse(process.env['test-config']);
if (config) { setup(config); }

module.exports = setup;
