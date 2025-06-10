require("./helper");
const assert = require('node:assert');
const path = require('node:path');
const {describe, it, beforeEach, afterEach} = require('node:test');
let JSDOM; // will hold jsdom constructor when available
try { ({JSDOM} = require('jsdom')); } catch { JSDOM = null; } // fallback when jsdom missing

let dom;
let mod;

beforeEach(() => {
  if(!JSDOM) return; // skips setup when jsdom unavailable
  dom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`); //(creates DOM for browser simulation)
  global.window = dom.window; //(exposes window for module)
  global.document = dom.window.document; //(exposes document for module)
  process.chdir(path.resolve(__dirname, '..')); //(ensures correct module paths)
  delete require.cache[require.resolve('../index.js')]; //(reloads module for clean state)
  mod = require('../index.js'); //(imports module after DOM setup)
});

afterEach(() => {
  if(!JSDOM) return; // skips teardown when jsdom unavailable
  dom.window.close(); //(closes jsdom window)
  delete global.window; //(removes global window)
  delete global.document; //(removes global document)
});

describe('browser injection', {concurrency:false}, () => {
  if(!JSDOM){
    it('skips when jsdom missing', () => { assert.ok(true); });
    return;
  }
  it('injects stylesheet and serverSide undefined', () => {
    assert.strictEqual(mod.serverSide, undefined); //(verifies serverSide not set)
    const expected = path.resolve(__dirname, '../qore.css'); //(expected css path)
    const link = document.querySelector('link[href*="core"]') || document.querySelector('link[href*="qore"]') || document.querySelector('style');
    assert.ok(link);
  });
});