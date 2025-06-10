require("./helper");
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {describe, it, beforeEach, afterEach} = require('node:test');
let build;
let tmpDir;

beforeEach(() => {
  process.env.CODEX = 'True';
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'buildtest-'));
  fs.writeFileSync(path.join(tmpDir, 'qore.css'), 'body{}');
  delete require.cache[require.resolve('../scripts/build')];
  build = require('../scripts/build');
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('build offline', {concurrency:false}, () => {
  it('creates hashed css and hash file', async () => {
    const hash = await build(tmpDir); //(run build in temp dir)
    const minPath = path.join(tmpDir, `core.${hash}.min.css`);
    const hashFile = path.join(tmpDir, 'build.hash');
    assert.ok(fs.existsSync(minPath));
    assert.ok(fs.existsSync(hashFile));
  });
});
