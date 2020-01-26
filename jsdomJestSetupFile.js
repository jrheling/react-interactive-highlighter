// based on https://airbnb.io/enzyme/docs/guides/jsdom.html
//
// hookup (done in jest.config) based on description in
//   https://www.codementor.io/pkodmad/dom-testing-react-application-jest-k4ll4f8sd

const { JSDOM } = require('jsdom');

const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const { window } = jsdom;

function copyProps(src, target) {
  Object.defineProperties(target, {
    ...Object.getOwnPropertyDescriptors(src),
    ...Object.getOwnPropertyDescriptors(target),
  });
}

global.window = window;
global.document = window.document;
global.navigator = {
  userAgent: 'node.js',
};
// global.requestAnimationFrame = function (callback) {
//   return setTimeout(callback, 0);
// };
// global.cancelAnimationFrame = function (id) {
//   clearTimeout(id);
// };
global.getSelection = function () {
    console.log("in mocked getSelection!");
}
copyProps(window, global);