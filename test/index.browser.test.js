require("./helper");
const assert = require('node:assert');
const path = require('node:path');
const {describe, it, beforeEach, afterEach} = require('node:test');
const {JSDOM} = require('jsdom');

let dom;
let mod;

beforeEach(() => {
  dom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`); //(creates DOM for browser simulation)
  global.window = dom.window; //(exposes window for module)
  global.document = dom.window.document; //(exposes document for module)
  process.chdir(path.resolve(__dirname, '..')); //(ensures correct module paths)
  delete require.cache[require.resolve('../index.js')]; //(reloads module for clean state)
  mod = require('../index.js'); //(imports module after DOM setup)
});

afterEach(() => {
  dom.window.close(); //(closes jsdom window)
  delete global.window; //(removes global window)
  delete global.document; //(removes global document)
});

describe('browser injection', {concurrency:false}, () => {
  it('injects stylesheet and serverSide undefined', () => {
    assert.strictEqual(mod.serverSide, undefined); //(verifies serverSide not set)
    const expected = path.resolve(__dirname, '../core.css'); //(expected css path)
    const link = document.head.querySelector(`link[href="${expected}"]`); //(finds injected link)
    assert.ok(link); //(ensures link exists)
  });
});
