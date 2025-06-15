/*
 * PERFORMANCE TESTING - RESPONSE TIME MEASUREMENT VALIDATION
 *
 * PURPOSE AND RATIONALE:
 * This suite verifies the performance script's ability to measure request
 * times, compute averages, and manage result history. Running in offline mode
 * (CODEX=True) isolates the tests from network latency, ensuring predictable
 * outcomes. Temporary directories prevent file collisions and leave no residue
 * on the repository after tests complete.
 *
 * TESTING STRATEGY:
 * - getTime() should always return a numeric value representing one request
 *   duration.
 * - measureUrl() averages multiple timings to validate aggregation logic.
 * - run() appends a new result and trims history to the most recent fifty
 *   entries so the results file doesn't grow indefinitely.
 */

require("./helper");
const assert = require('node:assert');
const {describe, it, beforeEach, afterEach} = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
let origCwd;
let performance;

beforeEach(() => {
  process.env.CODEX = 'True';
  delete require.cache[require.resolve('../scripts/performance')];
  performance = require('../scripts/performance');
  origCwd = process.cwd();
});

afterEach(() => {
  process.chdir(origCwd); //(restore original working directory)
  delete process.env.CODEX; //(cleanup CODEX flag)
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

describe('run trims history', {concurrency:false}, () => {
  let tmpDir;
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'perf-')); //(temporary directory for file operations)
    const history = Array.from({length:55}, (_,i)=>({timestamp:`${i}`, results:{}})); //(pre-seeded history)
    fs.writeFileSync(path.join(tmpDir,'performance-results.json'), JSON.stringify(history)); //(create initial file)
    fs.writeFileSync(path.join(tmpDir, 'build.hash'), 'abcdef'); //(mock hash file required by run)
    process.chdir(tmpDir); //(switch cwd for script)
    process.argv = ['node','scripts/performance.js','1','--json']; //(setup argv for run function)
  });
  afterEach(() => {
    fs.rmSync(tmpDir, {recursive:true, force:true}); //(remove temp directory)
    process.argv = ['node','']; //(reset argv)
  });
  it('keeps last 50 entries', async () => {
    await performance.run(); //(execute run to append and trim)
    const file = JSON.parse(fs.readFileSync(path.join(tmpDir,'performance-results.json'),'utf8')); //(read updated history)
    assert.strictEqual(file.length, 50); //(ensure trimming to max)
  });
});

describe('run without build.hash', {concurrency:false}, () => {
  let tmpDir;
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'perf-')); //(temporary directory for file operations)
    process.chdir(tmpDir); //(switch cwd for script without hash)
    process.argv = ['node','scripts/performance.js','1']; //(setup argv)
  });
  afterEach(() => {
    fs.rmSync(tmpDir, {recursive:true, force:true}); //(remove temp directory)
    process.argv = ['node','']; //(reset argv)
  });
  it('returns numeric result', async () => {
    const result = await performance.run(); //(execute run without hash)
    assert.strictEqual(typeof result, 'number'); //(validate numeric return)
  });
});

describe('run with invalid history', {concurrency:false}, () => {
  let tmpDir;
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'perf-')); //(temporary directory for file operations)
    fs.writeFileSync(path.join(tmpDir,'performance-results.json'), '{bad'); //(create malformed history)
    fs.writeFileSync(path.join(tmpDir, 'build.hash'), 'abcdef'); //(mock hash file required by run)
    process.chdir(tmpDir); //(switch cwd for script)
    process.argv = ['node','scripts/performance.js','1','--json']; //(enable json output)
  });
  afterEach(() => {
    fs.rmSync(tmpDir, {recursive:true, force:true}); //(cleanup temp directory)
    process.argv = ['node','']; //(reset argv)
  });
  it('handles parse errors gracefully', async () => {
    const result = await performance.run(); //(execute run with malformed history)
    assert.strictEqual(typeof result,'number'); //(script should still return number)
    const file = JSON.parse(fs.readFileSync(path.join(tmpDir,'performance-results.json'),'utf8')); //(history rewritten)
    assert.strictEqual(file.length,1); //(should create new array with single entry)
  });
});

describe('measureUrl invalid count', {concurrency:false}, () => {
  it('rejects non-positive count', async () => {
    await assert.rejects(
      async () => await performance.measureUrl('http://a', 0), // invalid count should throw
      err => err.message === 'count must be positive integer' // validates error message
    );
  });
});

describe('CDN_BASE_URL trailing slashes', {concurrency:false}, () => {
  let tmpDir;
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'perf-')); //(temporary directory for file operations)
    process.chdir(tmpDir); //(switch cwd for script)
    fs.writeFileSync(path.join(tmpDir, 'build.hash'), 'abcdef'); //(mock hash file required by run)
    process.env.CDN_BASE_URL = 'http://testcdn///'; //(set trailing slashes for test)
    process.argv = ['node','scripts/performance.js','1']; //(setup argv for run function)
    delete require.cache[require.resolve('../scripts/performance')]; //(reload module to apply env)
    performance = require('../scripts/performance'); //(import performance after env setup)
  });
  afterEach(() => {
    fs.rmSync(tmpDir, {recursive:true, force:true}); //(remove temp directory)
    process.argv = ['node','']; //(reset argv)
    delete process.env.CDN_BASE_URL; //(cleanup env var)
  });
  it('trims trailing slashes from CDN base', async () => {
    const {mock} = require('node:test');
    const spy = mock.method(console, 'log', ()=>{}); //(capture log output)
    await performance.run(); //(execute run to produce URLs)
    const call = spy.mock.calls.find(c => String(c.arguments[0]).startsWith('Average for')); //(find first average line)
    const match = String(call.arguments[0]).match(/Average for (.+):/); //(regex extracts url before colon after path)
    const url = match ? match[1] : '';//(isolate url string from log)
    const base = url.split('/gh/')[0]; //(extract base domain before repo path)
    assert.strictEqual(base, 'http://testcdn'); //(expect trailing slashes removed)
  });
});
