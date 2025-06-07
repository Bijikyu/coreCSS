require("./helper");
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {describe, it, beforeEach, afterEach} = require('node:test');
const updateHtml = require('../scripts/updateHtml');

let tmpDir;

beforeEach(async () => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'htmltest-'));
  fs.writeFileSync(path.join(tmpDir, 'build.hash'), '12345678');
  fs.writeFileSync(path.join(tmpDir, 'index.html'), '<link href="core.aaaaaaaa.min.css">\n{{CDN_BASE_URL}}');
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(path.resolve(__dirname, '..'));
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('updateHtml', () => {
  it('updates html with hash and CDN url', async () => {
    process.env.CDN_BASE_URL = 'http://testcdn';
    const hash = await updateHtml();
    const updated = fs.readFileSync(path.join(tmpDir, 'index.html'), 'utf8');
    assert.ok(updated.includes('core.12345678.min.css'));
    assert.ok(updated.includes('http://testcdn'));
    assert.strictEqual(hash, '12345678');
  });
});
