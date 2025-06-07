require("./helper");
const assert = require('node:assert');
const {describe, it, beforeEach} = require('node:test');
let performance;

beforeEach(() => {
  process.env.CODEX = 'True';
  delete require.cache[require.resolve('../scripts/performance')];
  performance = require('../scripts/performance');
});

describe('getTime mocked', {concurrency:false}, () => {
  it('returns numeric time', async () => {
    const t = await performance.getTime('http://a');
    assert.strictEqual(typeof t, 'number');
  });
});

describe('measureUrl avg', {concurrency:false}, () => {
  it('returns average time', async () => {
    const avg = await performance.measureUrl('http://a',2);
    assert.strictEqual(typeof avg,'number');
  });
});
