require('./helper');
const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');
const {describe, it} = require('node:test');
let JSDOM; try { ({JSDOM} = require('jsdom')); } catch { JSDOM = null; }

describe('browser without require', {concurrency:false}, () => {
  if(!JSDOM){ it('skips when jsdom missing', () => { assert.ok(true); }); return; }
  it('loads index.js via script when require undefined', () => {
    const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {runScripts:'dangerously', url:'https://example.com/'});
    const script = fs.readFileSync(path.resolve(__dirname, '../index.js'), 'utf8');
    assert.doesNotThrow(() => { dom.window.eval(script); }); // ensures no ReferenceError when require missing
    assert.ok(dom.window.qorecss); // confirms global API exposed
    dom.window.close();
  });
});
