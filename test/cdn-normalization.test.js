require('./helper'); // loads axios/qerrors stubs for test isolation
const assert = require('node:assert'); // assertion library for validations
const fs = require('node:fs'); // filesystem access for temporary files
const path = require('node:path'); // path utilities for cross-platform tmp dirs
const os = require('node:os'); // os module provides tmp directory location
const {describe,it,beforeEach,afterEach} = require('node:test'); // test harness API
const updateHtml = require('../scripts/updateHtml'); // script being compared
let tmpDir; // temp directory for isolated execution
let performance; // module under test for CDN normalization
let origCwd; // original working directory

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(),'cdn-norm-')); // create isolated tmp dir
  fs.writeFileSync(path.join(tmpDir,'build.hash'),'abcd1234'); // mock build hash
  fs.writeFileSync(path.join(tmpDir,'index.html'),'{{CDN_BASE_URL}}'); // minimal html template
  origCwd = process.cwd(); // save cwd for restoration
  process.chdir(tmpDir); // run scripts inside tmp dir
  process.env.CDN_BASE_URL = 'http://testcdn/////'; // base url with extra slashes for test
  process.env.CODEX = 'True'; // offline mode to avoid network
  delete require.cache[require.resolve('../scripts/performance')]; // reload module with env
  performance = require('../scripts/performance'); // import fresh performance script
});

afterEach(() => {
  process.chdir(origCwd); // restore original directory
  fs.rmSync(tmpDir,{recursive:true,force:true}); // cleanup temporary files
  delete process.env.CDN_BASE_URL; // remove env config to avoid bleed
  delete process.env.CODEX; // clear offline flag
});

describe('cdn url normalization consistency',{concurrency:false},() => {
  it('normalizes trailing slashes identically', async () => {
    const perfBase = performance.CDN_BASE_URL; // normalized value from performance script
    await updateHtml(); // run html updater with same env value
    const html = fs.readFileSync(path.join(tmpDir,'index.html'),'utf8'); // read updated html
    const htmlBase = html.trim(); // placeholder replaced value
    assert.strictEqual(perfBase, htmlBase); // ensure both scripts match
  });
});
