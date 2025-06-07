require("./helper");
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {describe, it, before, after} = require('node:test');
let build, updateHtml;
let tmpDir;

before(() => {
  process.env.CODEX = 'True';
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'integ-'));
  fs.writeFileSync(path.join(tmpDir, 'qore.css'), 'body{}');
  fs.writeFileSync(path.join(tmpDir, 'index.html'), '<link href="core.aaaaaaaa.min.css">\n{{CDN_BASE_URL}}'); // placeholder with 8 digits
  process.chdir(tmpDir);
  delete require.cache[require.resolve('../scripts/build')];
  delete require.cache[require.resolve('../scripts/updateHtml')];
  build = require('../scripts/build');
  updateHtml = require('../scripts/updateHtml');
});

after(() => {
  process.chdir(path.resolve(__dirname, '..'));
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('build and updateHtml', {concurrency:false}, () => {
  it('builds and updates html', async () => {
    const hash = await build();
    process.env.CDN_BASE_URL = 'http://cdn';
    await updateHtml();
    const html = fs.readFileSync(path.join(tmpDir, 'index.html'), 'utf8');
    assert.ok(html.includes(`core.${hash}.min.css`));
    assert.ok(html.includes('http://cdn'));
  });
});
