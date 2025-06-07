require("./helper"); //load shared stubs
const assert = require('node:assert'); //node assert library for tests
const fs = require('node:fs'); //filesystem module for temp files
const path = require('node:path'); //path utilities for file paths
const os = require('node:os'); //os module to find temp dir
const {describe, it, before, after} = require('node:test'); //test framework functions
let build, updateHtml, purgeCdn; //holds imported scripts
let tmpDir; //temporary directory path

before(() => {
  process.env.CODEX = 'True'; //enable offline mode
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'purge-')); //create unique temp directory
  fs.writeFileSync(path.join(tmpDir, 'qore.css'), 'body{}'); //create placeholder css
  fs.writeFileSync(path.join(tmpDir, 'index.html'), '<link href="core.aaaaaaaa.min.css">\n{{CDN_BASE_URL}}'); //create placeholder html
  process.chdir(tmpDir); //switch to temp dir
  delete require.cache[require.resolve('../scripts/build')]; //ensure fresh build module
  delete require.cache[require.resolve('../scripts/updateHtml')]; //ensure fresh updateHtml module
  delete require.cache[require.resolve('../scripts/purge-cdn')]; //ensure fresh purge module
  build = require('../scripts/build'); //import build function
  updateHtml = require('../scripts/updateHtml'); //import updateHtml function
  purgeCdn = require('../scripts/purge-cdn'); //import purgeCdn function
});

after(() => {
  process.chdir(path.resolve(__dirname, '..')); //return to repo root
  fs.rmSync(tmpDir, {recursive: true, force: true}); //remove temp directory
});

describe('build update purge', {concurrency:false}, () => { //group test steps
  it('updates html and purges cdn', async () => { //single integration test
    const hash = await build(); //run build to create hashed css
    process.env.CDN_BASE_URL = 'http://cdn'; //set cdn url for html update
    await updateHtml(); //update html file with hash and cdn
    const code = await purgeCdn(`core.${hash}.min.css`); //purge cdn using file name
    const html = fs.readFileSync(path.join(tmpDir, 'index.html'), 'utf8'); //read updated html
    assert.ok(html.includes(`core.${hash}.min.css`)); //verify hashed css reference
    assert.strictEqual(code, 200); //verify purge returned 200
  });
});
