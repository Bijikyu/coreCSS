/*
 * COMPLETE DEPLOYMENT PIPELINE INTEGRATION TESTING
 * 
 * PURPOSE AND RATIONALE:
 * This test suite validates the complete end-to-end deployment workflow by
 * executing build, HTML update, and CDN purge operations in sequence. This
 * comprehensive integration testing ensures all deployment components work
 * together correctly in realistic deployment scenarios.
 * 
 * TESTING STRATEGY:
 * - Full workflow execution from build through CDN purge
 * - Realistic file artifacts and directory structure
 * - Environment-specific configuration validation
 * - Cross-script coordination and data flow verification
 * 
 * This approach ensures the complete deployment pipeline produces correct
 * results and all scripts coordinate properly for successful deployments.
 */

require("./helper"); // load shared stubs for consistent test environment
const assert = require('node:assert'); // node assert library for tests validation
const fs = require('node:fs'); // filesystem module for temp files and validation
const path = require('node:path'); // path utilities for file paths and resolution
const os = require('node:os'); // os module to find temp dir for isolation
const {describe, it, before, after} = require('node:test'); // test framework functions for organization
let build, updateHtml, purgeCdn; // holds imported scripts for integration testing
let tmpDir; // temporary directory path for isolated execution

/*
 * INTEGRATION TEST SETUP
 * 
 * COMPLETE WORKFLOW SIMULATION:
 * Creates a realistic deployment environment with all necessary files and
 * configuration. This setup enables testing the complete workflow from
 * initial CSS through final CDN cache invalidation.
 */
before(() => {
  process.env.CODEX = 'True'; // enable offline mode for reliable testing without network dependencies
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'purge-')); // create unique temp directory for test isolation
  fs.writeFileSync(path.join(tmpDir, 'qore.css'), 'body{}'); // create placeholder css for build processing
  fs.writeFileSync(path.join(tmpDir, 'index.html'), '<link href="core.aaaaaaaa.min.css">\n{{CDN_BASE_URL}}'); // create placeholder html with templates
  process.chdir(tmpDir); // switch to temp dir for script execution context
  delete require.cache[require.resolve('../scripts/build')]; // ensure fresh build module without cached state
  delete require.cache[require.resolve('../scripts/updateHtml')]; // ensure fresh updateHtml module without cached state
  delete require.cache[require.resolve('../scripts/purge-cdn')]; // ensure fresh purge module without cached state
  build = require('../scripts/build'); // import build function for workflow execution
  updateHtml = require('../scripts/updateHtml'); // import updateHtml function for workflow execution
  ({purgeCdn} = require('../scripts/purge-cdn')); // import purgeCdn function via destructuring for workflow execution
});

/*
 * INTEGRATION TEST CLEANUP
 * 
 * ENVIRONMENT RESTORATION:
 * Restores the test environment to prevent integration test artifacts from
 * affecting subsequent tests. Proper cleanup ensures test isolation and
 * prevents environment pollution across test runs.
 */
after(() => {
  process.chdir(path.resolve(__dirname, '..')); // return to repo root directory
  fs.rmSync(tmpDir, {recursive: true, force: true}); // remove temp directory and all contents
  delete process.env.CODEX; // restore CODEX env so other tests run online mode
});

/*
 * COMPLETE DEPLOYMENT WORKFLOW VALIDATION
 * 
 * TESTING SCOPE:
 * Executes the complete deployment sequence (build → updateHtml → purgeCdn)
 * and validates that all components coordinate correctly to produce the
 * expected deployment artifacts and operations.
 */
describe('build update purge', {concurrency:false}, () => {
  /*
   * END-TO-END DEPLOYMENT WORKFLOW VALIDATION
   * 
   * TEST STRATEGY:
   * Executes all deployment scripts in sequence and validates both
   * intermediate and final outputs. This confirms the complete workflow
   * produces correctly configured assets and successful CDN operations.
   */
  it('updates html and purges cdn', async () => {
    const hash = await build(); // run build to create hashed css and generate build artifacts
    process.env.CDN_BASE_URL = 'http://cdn'; // set cdn url for html update template replacement
    await updateHtml(); // update html file with hash and cdn configuration
    const code = await purgeCdn(`core.${hash}.min.css`); // purge cdn using exact generated file name
    const html = fs.readFileSync(path.join(tmpDir, 'index.html'), 'utf8'); // read updated html for validation
    assert.ok(html.includes(`core.${hash}.min.css`)); // verify hashed css reference in final html
    assert.strictEqual(code, 200); // verify purge returned success code in offline mode
  });
});
