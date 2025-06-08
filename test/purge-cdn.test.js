require('./helper');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const Module = require('module'); // access module loader for dependency stubs
const {describe, it, beforeEach, afterEach} = require('node:test');

let purgeCdn, run; // will hold imported functions under test
let tmpDir, calledUrl; // track temporary dir and requested URL for assertions

// helper to load module with dependency stubs
const baseReq = Module.prototype.require; // original require used by helper.js

function load(stubs={}){
  Module.prototype.require = function(id){
    if(id === './request-retry') return stubs.fetchRetry; // provides fetch stub
    if(id === 'fs') return { ...baseReq.call(this,'fs'), promises: stubs.fs || baseReq.call(this,'fs').promises }; // overrides fs if given
    return baseReq.call(this,id); // fallback to existing behavior
  };
  delete require.cache[require.resolve('../scripts/purge-cdn')];
  ({purgeCdn, run} = require('../scripts/purge-cdn'));
  Module.prototype.require = baseReq; // restore require after loading
}

describe('purgeCdn offline', {concurrency:false}, () => {
  beforeEach(() => {
    process.env.CODEX = 'True';
    load({fetchRetry: async () => ({status:999})}); // load script with offline fetch stub
  });
  afterEach(() => {
    delete process.env.CODEX;
  });
  it('returns 200 when CODEX True', async () => {
    const code = await purgeCdn('file.css');
    assert.strictEqual(code, 200);
  });
});

describe('purgeCdn online', {concurrency:false}, () => {
  beforeEach(() => {
    calledUrl = '';
    load({fetchRetry: async (url) => { calledUrl = url; return {status:201}; }}); // script uses stubbed fetch
  });
  afterEach(() => {
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
    load({fetchRetry: async (url) => { calledUrl = url; return {status:202}; }, fs: fs.promises}); // stub dependencies with temp dir fs
  });
  afterEach(() => {
    process.chdir(path.resolve(__dirname, '..'));
    fs.rmSync(tmpDir, {recursive:true, force:true});
  });
  it('purges hashed file', async () => {
    const code = await run();
    assert.strictEqual(code, 202);
    assert.ok(calledUrl.includes('core.12345678.min.css'));
  });
});