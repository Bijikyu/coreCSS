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
  fs.copyFileSync(path.resolve(__dirname, '../index.js'), path.join(tmpDir, 'index.js')); // copies index.js for hash injection test
  process.chdir(tmpDir);
  delete require.cache[require.resolve('../scripts/build')];
  build = require('../scripts/build');
});

afterEach(() => {
  process.chdir(path.resolve(__dirname, '..'));
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('build offline', {concurrency:false}, () => {
  it('creates hashed css, hash file and updates index.js', async () => {
    const hash = await build();
    const minPath = path.join(tmpDir, `core.${hash}.min.css`);
    const hashFile = path.join(tmpDir, 'build.hash');
    const indexPath = path.join(tmpDir, 'index.js');
    assert.ok(fs.existsSync(minPath));
    assert.ok(fs.existsSync(hashFile));
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    assert.ok(indexContent.includes(`core.${hash}.min.css`));
  });
});
