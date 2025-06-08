require("./helper");
const assert = require('node:assert');
const path = require('node:path');
const {describe, it, beforeEach, afterEach} = require('node:test');

let mod;
beforeEach(() => {
  process.chdir(path.resolve(__dirname, '..')); // ensures paths resolve correctly
  delete require.cache[require.resolve('../index.js')]; // resets module cache
  mod = require('../index.js'); // imports module
});

describe('index module', {concurrency:false}, () => {
  it('exports coreCss path that exists', () => {
    assert.ok(require('fs').existsSync(mod.coreCss));
  });

  it('exports variablesCss path that exists', () => {
    assert.ok(require('fs').existsSync(mod.variablesCss));
  });

  it('getStylesheet returns coreCss path', () => {
    assert.strictEqual(mod.getStylesheet(), mod.coreCss);
  });

  it('getVariables returns variablesCss path', () => {
    assert.strictEqual(mod.getVariables(), mod.variablesCss);
  });

  it('serverSide flag is true in Node environment', () => {
    assert.strictEqual(mod.serverSide, true);
  });
});
