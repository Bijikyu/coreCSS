/*
 * BUILD SCRIPT TESTING - OFFLINE ENVIRONMENT VALIDATION
 * 
 * PURPOSE AND RATIONALE:
 * This test suite validates the build script's core functionality in isolation
 * from network dependencies. Testing in offline mode ensures the build process
 * works reliably regardless of network conditions and prevents test failures
 * due to external service availability.
 * 
 * TESTING STRATEGY:
 * - Isolated temporary directories prevent test interference
 * - CODEX environment flag forces offline behavior
 * - Module cache clearing ensures fresh script execution
 * - File system validation confirms all expected artifacts are created
 * 
 * This approach provides reliable testing of the content hashing, compression,
 * and index.js injection workflow that is critical to the framework's operation.
 */

require("./helper"); // loads module stubbing for axios and qerrors dependencies
const assert = require('node:assert'); // Node.js built-in assertion library for test validation
const fs = require('node:fs'); // file system operations for test setup and validation
const path = require('node:path'); // path utilities for cross-platform file handling
const os = require('node:os'); // operating system utilities for temporary directory creation
const {describe, it, beforeEach, afterEach} = require('node:test'); // Node.js native test framework components
let build; // build function reference, assigned after module cache clearing
let tmpDir; // temporary directory path for isolated test execution

/*
 * TEST SETUP CONFIGURATION
 * 
 * ISOLATION STRATEGY:
 * Each test runs in a fresh temporary directory with minimal CSS input
 * to ensure tests don't interfere with each other or rely on existing
 * build artifacts. This approach guarantees reproducible test results.
 */
beforeEach(() => {
  process.env.CODEX = 'True'; // forces offline mode to prevent network calls during testing
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'buildtest-')); // creates unique temporary directory for test isolation
  fs.writeFileSync(path.join(tmpDir, 'qore.css'), 'body{}'); // minimal CSS input file for build processing
  fs.copyFileSync(path.resolve(__dirname, '../index.js'), path.join(tmpDir, 'index.js')); // copies index.js for hash injection test
  process.chdir(tmpDir); // changes working directory to temporary location for script execution
  delete require.cache[require.resolve('../scripts/build')]; // clears module cache to ensure fresh script loading
  build = require('../scripts/build'); // imports build function after cache clearing
});

/*
 * TEST CLEANUP PROCEDURE
 * 
 * CLEANUP RATIONALE:
 * Restores original working directory and removes temporary files to prevent
 * test artifacts from accumulating and affecting subsequent test runs.
 * Proper cleanup ensures test environment consistency.
 */
afterEach(() => {
  process.chdir(path.resolve(__dirname, '..')); // restores original working directory
  fs.rmSync(tmpDir, {recursive: true, force: true}); // removes temporary directory and all contents
});

/*
 * BUILD FUNCTIONALITY VALIDATION
 * 
 * TESTING SCOPE:
 * Validates the complete build workflow including CSS processing, hash generation,
 * file creation, and index.js injection. This test ensures all critical build
 * outputs are generated correctly in offline mode.
 */
describe('build offline', {concurrency:false}, () => {
  /*
   * COMPREHENSIVE BUILD OUTPUT VALIDATION
   * 
   * TEST STRATEGY:
   * Verifies that build() function creates all expected artifacts:
   * 1. Hashed CSS file (core.{hash}.min.css)
   * 2. Hash persistence file (build.hash)
   * 3. Updated index.js with correct hash injection
   * 
   * This test confirms the entire build pipeline works correctly.
   */
  it('creates hashed css, hash file and updates index.js', async () => {
    const hash = await build(); // executes build function and captures returned hash
    const minPath = path.join(tmpDir, `core.${hash}.min.css`); // constructs expected hashed CSS file path
    const hashFile = path.join(tmpDir, 'build.hash'); // constructs expected hash file path
    const indexPath = path.join(tmpDir, 'index.js'); // constructs path to index.js for injection verification
    assert.ok(fs.existsSync(minPath)); // verifies hashed CSS file was created
    assert.ok(fs.existsSync(hashFile)); // verifies hash persistence file was created
    const indexContent = fs.readFileSync(indexPath, 'utf8'); // reads index.js content for hash injection verification
    assert.ok(indexContent.includes(`core.${hash}.min.css`)); // confirms hash was properly injected into index.js
  });
});
