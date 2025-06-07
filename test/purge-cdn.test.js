require('./helper');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {describe, it, beforeEach, afterEach} = require('node:test');

let purgeCdn, run;
let tmpDir, calledUrl;

// helper to load module with globals
function load(){
  delete require.cache[require.resolve('../scripts/purge-cdn')];
  ({purgeCdn, run} = require('../scripts/purge-cdn'));
}

describe('purgeCdn offline', {concurrency:false}, () => {
  beforeEach(() => {
    process.env.CODEX = 'True';
    global.fetchRetry = async () => ({status:999}); // fetch stub when offline
    load();
  });
  afterEach(() => {
    delete process.env.CODEX;
    delete global.fetchRetry;
  });
  it('returns 200 when CODEX True', async () => {
    const code = await purgeCdn('file.css');
    assert.strictEqual(code, 200);
  });
});

describe('purgeCdn online', {concurrency:false}, () => {
  beforeEach(() => {
    calledUrl = '';
    global.fetchRetry = async (url) => { calledUrl = url; return {status:201}; };
    load();
  });
  afterEach(() => {
    delete global.fetchRetry;
  });
  it('returns status from fetchRetry', async () => {
    const code = await purgeCdn('abc.css');
    assert.strictEqual(code, 201);
    assert.ok(calledUrl.includes('abc.css'));
  });
});

describe('run uses hash', {concurrency:false}, () => {
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'purge-'));
    fs.writeFileSync(path.join(tmpDir, 'build.hash'), '12345678');
    process.chdir(tmpDir);
    calledUrl = '';
    global.fetchRetry = async (url) => { calledUrl = url; return {status:202}; };
    global.fs = fs.promises;
    load();
  });
  afterEach(() => {
    process.chdir(path.resolve(__dirname, '..'));
    fs.rmSync(tmpDir, {recursive:true, force:true});
    delete global.fetchRetry;
    delete global.fs;
  });
  it('purges hashed file', async () => {
    const code = await run();
    assert.strictEqual(code, 202);
    assert.ok(calledUrl.includes('core.12345678.min.css'));
  });
});
