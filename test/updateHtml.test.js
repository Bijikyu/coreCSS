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
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('updateHtml', () => {
  it('updates html with hash and CDN url', async () => {
    process.env.CDN_BASE_URL = 'http://testcdn';
    const hash = await updateHtml(tmpDir); //(update html in temp dir)
    const updated = fs.readFileSync(path.join(tmpDir, 'index.html'), 'utf8');
    assert.ok(updated.includes('core.12345678.min.css'));
    assert.ok(updated.includes('http://testcdn'));
    assert.strictEqual(hash, '12345678');
  });

  it('replaces qore.css when hash missing', async () => { //(new scenario for plain css)
    fs.writeFileSync(path.join(tmpDir, 'index.html'), '<link href="qore.css">'); //(setup html without placeholder)
    const hash = await updateHtml(tmpDir); //(run update on qore.css html)
    const updated = fs.readFileSync(path.join(tmpDir, 'index.html'), 'utf8'); //(read modified html)
    assert.ok(updated.includes('core.12345678.min.css')); //(verify replacement)
    assert.strictEqual(hash, '12345678'); //(ensure returned hash unchanged)
  });
});
