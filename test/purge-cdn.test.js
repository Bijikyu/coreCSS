/*
 * CDN PURGE TESTING - CACHE INVALIDATION VALIDATION
 * 
 * PURPOSE AND RATIONALE:
 * This test suite validates the CDN purge functionality for jsDelivr cache
 * invalidation. Testing requires careful mocking because CDN purge operations
 * involve external API calls that must work reliably in both offline
 * development and online production environments.
 * 
 * TESTING STRATEGY:
 * - Custom module loading with dependency injection for precise control
 * - Environment-specific behavior testing (offline vs online modes)
 * - File system integration testing for build hash coordination
 * - URL construction validation for correct jsDelivr API usage
 * 
 * This approach ensures CDN purge operations work correctly across different
 * environments while maintaining integration with the build system workflow.
 */

require('./helper'); // loads basic module stubbing for consistent test environment
const assert = require('node:assert'); // Node.js built-in assertion library for test validation
const fs = require('node:fs'); // file system operations for temporary file testing
const path = require('node:path'); // path utilities for cross-platform file handling
const os = require('node:os'); // operating system utilities for temporary directory creation
const Module = require('module'); // access module loader for dependency stubs and custom require logic
const {describe, it, beforeEach, afterEach} = require('node:test'); // Node.js native test framework components

let purgeCdn, run; // will hold imported functions under test after dependency injection
let tmpDir, calledUrl; // track temporary dir and requested URL for assertions and validation

/*
 * CUSTOM MODULE LOADING UTILITY
 * 
 * DEPENDENCY INJECTION STRATEGY:
 * This function enables precise control over module dependencies by replacing
 * specific requires with test stubs. This approach is necessary because the
 * purge-cdn module has specific dependencies that need mocking for testing.
 */
const baseReq = Module.prototype.require; // original require used by helper.js, preserved for fallback

function load(stubs={}){
  /*
   * CUSTOM REQUIRE IMPLEMENTATION
   * 
   * STUBBING RATIONALE:
   * Replaces specific module dependencies with test doubles while preserving
   * normal require behavior for other modules. This enables testing of
   * network-dependent code without actual network calls.
   */
  Module.prototype.require = function(id){
    if(id === './request-retry') return stubs.fetchRetry; // provides fetch stub for network call control
    if(id === 'fs') return { ...baseReq.call(this,'fs'), promises: stubs.fs || baseReq.call(this,'fs').promises }; // overrides fs if given for file system control
    return baseReq.call(this,id); // fallback to existing behavior for all other modules
  };
  delete require.cache[require.resolve('../scripts/purge-cdn')]; // clears module cache for fresh loading with stubs
  ({purgeCdn, run} = require('../scripts/purge-cdn')); // imports purge functions with dependency injection
  Module.prototype.require = baseReq; // restore require after loading to prevent test interference
}

/*
 * OFFLINE MODE PURGE TESTING
 * 
 * TESTING SCOPE:
 * Validates that purgeCdn correctly detects offline mode (CODEX=True) and
 * returns mock success responses without making actual network requests.
 * This ensures development environments work reliably without network access.
 */
describe('purgeCdn offline', {concurrency:false}, () => {
  /*
   * OFFLINE ENVIRONMENT SETUP
   * 
   * SETUP RATIONALE:
   * Sets CODEX environment flag to force offline behavior and loads the module
   * with a fetch stub that shouldn't be called. This tests the offline
   * detection logic that bypasses network operations during development.
   */
  beforeEach(() => {
    process.env.CODEX = 'True'; // forces offline mode for development testing
    load({fetchRetry: async () => ({status:999})}); // load script with offline fetch stub that shouldn't be called
  });
  afterEach(() => {
    delete process.env.CODEX; // cleans up environment flag to prevent test interference
  });
  
  /*
   * OFFLINE MODE BEHAVIOR VALIDATION
   * 
   * TEST STRATEGY:
   * Verifies that purgeCdn returns the expected offline success code (200)
   * without making network requests. This confirms the offline development
   * workflow works correctly when network access is unavailable.
   */
  it('returns 200 when CODEX True', async () => {
    const code = await purgeCdn('file.css'); // executes purge in offline mode
    assert.strictEqual(code, 200); // confirms offline mode returns success code
  });
});

/*
 * ONLINE MODE PURGE TESTING
 * 
 * TESTING SCOPE:
 * Validates that purgeCdn correctly makes network requests in online mode
 * and properly constructs jsDelivr purge URLs. This ensures production
 * purge operations work correctly with the jsDelivr API.
 */
describe('purgeCdn online', {concurrency:false}, () => {
  /*
   * ONLINE ENVIRONMENT SETUP
   * 
   * SETUP RATIONALE:
   * Loads the module without CODEX flag and with a fetch stub that captures
   * the requested URL. This enables validation of both network call behavior
   * and URL construction for jsDelivr API compliance.
   */
  beforeEach(() => {
    calledUrl = ''; // initializes URL tracking for request validation
    load({fetchRetry: async (url) => { calledUrl = url; return {status:201}; }}); // script uses stubbed fetch with URL capture
  });
  afterEach(() => {
    // no cleanup needed for online mode testing
  });
  
  /*
   * NETWORK REQUEST AND URL VALIDATION
   * 
   * TEST STRATEGY:
   * Executes purgeCdn and validates both the response status and the
   * constructed URL. This ensures the function properly integrates with
   * the jsDelivr purge API and passes through response codes correctly.
   */
  it('returns status from fetchRetry', async () => {
    const code = await purgeCdn('abc.css'); // executes purge with test filename
    assert.strictEqual(code, 201); // confirms response status is passed through correctly
    assert.ok(calledUrl.includes('abc.css')); // validates filename is properly included in purge URL
  });
});

/*
 * BUILD HASH INTEGRATION TESTING
 * 
 * TESTING SCOPE:
 * Validates that the run() function correctly reads build hashes and
 * constructs proper filenames for purging. This tests the integration
 * between the build system and CDN purge workflow.
 */
describe('run uses hash', {concurrency:false}, () => {
  /*
   * BUILD INTEGRATION SETUP
   * 
   * SETUP RATIONALE:
   * Creates a temporary directory with a build.hash file to simulate the
   * post-build environment. This tests the complete workflow from build
   * hash reading through CDN purge URL construction.
   */
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'purge-')); // creates temporary directory for hash file testing
    fs.writeFileSync(path.join(tmpDir, 'build.hash'), '12345678'); // creates mock build hash file with test hash
    process.chdir(tmpDir); // changes to temporary directory for script execution
    calledUrl = ''; // initializes URL tracking for validation
    load({fetchRetry: async (url) => { calledUrl = url; return {status:202}; }, fs: fs.promises}); // stub dependencies with temp dir fs
  });
  afterEach(() => {
    process.chdir(path.resolve(__dirname, '..')); // restores original working directory
    fs.rmSync(tmpDir, {recursive:true, force:true}); // removes temporary directory and contents
  });
  
  /*
   * HASH-BASED FILENAME CONSTRUCTION VALIDATION
   * 
   * TEST STRATEGY:
   * Executes the run() function and validates that it properly reads the
   * build hash and constructs the correct hashed filename for purging.
   * This confirms build system integration works correctly.
   */
  it('purges hashed file', async () => {
    const code = await run(); // executes run function which reads hash file and purges
    assert.strictEqual(code, 202); // confirms purge request returns expected status code
    assert.ok(calledUrl.includes('core.12345678.min.css')); // validates correct hashed filename construction
  });
});
});