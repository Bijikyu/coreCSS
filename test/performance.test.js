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
    process.argv = ['node','scripts/performance.js','1','--json']; //(setup argv for run function)
  });
  afterEach(() => {
    fs.rmSync(tmpDir, {recursive:true, force:true}); //(remove temp directory)
    process.argv = ['node','']; //(reset argv)
  });
  it('keeps last 50 entries', async () => {
    await performance.run(tmpDir); //(execute run to append and trim)
    const file = JSON.parse(fs.readFileSync(path.join(tmpDir,'performance-results.json'),'utf8')); //(read updated history)
    assert.strictEqual(file.length, 50); //(ensure trimming to max)
  });
});
