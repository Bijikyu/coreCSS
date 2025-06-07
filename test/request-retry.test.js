require("./helper");
const assert = require('node:assert');
const {describe, it, beforeEach} = require('node:test');
const {mock} = require('node:test');

let fetchRetry;
let axios;

beforeEach(() => {
  axios = require('axios');
  mock.method(axios, 'get', async () => ({status:200}));
  delete require.cache[require.resolve('../scripts/request-retry')];
  fetchRetry = require('../scripts/request-retry');
});

describe('fetchRetry success', {concurrency:false}, () => {
  it('returns response on first try', async () => {
    const res = await fetchRetry('http://a');
    assert.strictEqual(res.status, 200);
  });
});

describe('fetchRetry retries then succeeds', {concurrency:false}, () => {
  it('retries failed attempts', async () => {
    let count = 0;
    mock.method(axios, 'get', async () => { count++; if(count<3) throw new Error('fail'); return {status:200}; });
    const res = await fetchRetry('http://b', {}, 3);
    assert.strictEqual(count,3);
    assert.strictEqual(res.status,200);
  });
});

describe('fetchRetry fails after attempts', {concurrency:false}, () => {
  it('throws after exhausting attempts', async () => {
    mock.method(axios, 'get', async () => { throw new Error('fail'); });
    await assert.rejects(fetchRetry('http://c', {}, 2));
  });
});
