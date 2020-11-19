function setup() {
  try { require('anux-common'); } catch (error) { /* do nothing */ }
  let enableReact = false;
  try { enableReact = !!require('react'); } catch (error) { /* do nothing */ }
  const chai = require('chai');
  const spies = require('chai-spies');
  const fuzzy = require('chai-fuzzy');
  const asPromised = require('chai-as-promised');

  chai.use(spies);
  chai.use(fuzzy);
  chai.use(asPromised);

  global['chai'] = chai;
  global['expect'] = chai.expect;

  if (enableReact) {
    const { JSDOM } = require('jsdom');
    const { window } = new JSDOM('<!doctype html><html><body></body></html>', {
      pretendToBeVisual: false,
      userAgent: 'mocha',
    });

    const React = require('react');
    const enzyme = require('enzyme');
    const Adapter = require('@wojtekmaj/enzyme-adapter-react-17');

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
    };

    enzyme.configure({ adapter: new Adapter() });
  }
}

// mocha can't call the function so we have to do it for it
// const config = process.env['test-config'] && JSON.parse(process.env['test-config']);
// eslint-disable-next-line mocha/no-top-level-hooks, mocha/no-hooks-for-single-case
if (process.env['is-mocha']) { setup(); }

module.exports = setup;
