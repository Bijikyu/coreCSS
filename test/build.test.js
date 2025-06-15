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

/*
 * POSTCSS BINARY ABSENCE VALIDATION
 *
 * TESTING SCENARIO:
 * Simulates an environment where the PostCSS binary is missing. The build
 * script should fallback to copying qore.css directly to core.min.css without
 * throwing an error. This mirrors CODEX mode behavior in a production setting.
 */
describe('build without postcss binary', {concurrency:false}, () => {
  it('copies css when postcss binary missing', async () => {
    const prevCodex = process.env.CODEX; // preserve incoming environment value
    process.env.CODEX = 'False'; // forces production mode to trigger postcss path check
    const origExists = fs.existsSync; // preserve original existsSync
    const missPath = path.join('node_modules', '.bin', 'postcss'); // target missing binary
    fs.existsSync = p => p.includes(missPath) ? false : origExists(p); // stub only for binary check
    const hash = await build(); // run build with stubbed binary absence
    fs.existsSync = origExists; // restore after build
    if(prevCodex !== undefined){ process.env.CODEX = prevCodex; } else { delete process.env.CODEX; } // restore CODEX to prior state
    const minPath = path.join(tmpDir, `core.${hash}.min.css`); // expected hashed CSS path
    const indexPath = path.join(tmpDir, 'index.js'); // index.js path for injection check
    assert.ok(fs.existsSync(minPath)); // hashed file should exist even without postcss
    const indexContent = fs.readFileSync(indexPath, 'utf8'); // read updated index.js
    assert.ok(indexContent.includes(`core.${hash}.min.css`)); // verify hash injection
  });
});

/*
 * WINDOWS BINARY PATH VALIDATION
 *
 * TESTING SCENARIO:
 * Ensures the build script resolves the correct PostCSS binary name on Windows
 * by checking the path passed to fs.existsSync when process.platform is win32.
 */
describe('build windows binary path', {concurrency:false}, () => {
  it('uses postcss.cmd on win32', async () => {
    const prevCodex = process.env.CODEX; // preserve incoming environment value
    process.env.CODEX = 'False'; // forces production mode for binary check
    const origPlat = Object.getOwnPropertyDescriptor(process,'platform'); // capture original platform descriptor
    Object.defineProperty(process,'platform',{value:'win32'}); // overrides platform to simulate windows
    const origExists = fs.existsSync; // preserve original existsSync
    let lookedPath; // captures binary path checked
    const expected = path.join('node_modules','.bin','postcss.cmd'); // expected path for windows binary
    fs.existsSync = p => { if(p.includes('postcss')){ lookedPath = p; return false; } return origExists(p); }; // intercepts binary check and avoids execution
    const hash = await build(); // run build with windows platform simulation
    fs.existsSync = origExists; // restore existsSync after build
    Object.defineProperty(process,'platform',origPlat); // restore original platform
    if(prevCodex !== undefined){ process.env.CODEX = prevCodex; } else { delete process.env.CODEX; } // restore CODEX to prior state
    assert.strictEqual(lookedPath, expected); // verifies correct binary path used on windows
    const minPath = path.join(tmpDir, `core.${hash}.min.css`); // expected hashed CSS path
    assert.ok(fs.existsSync(minPath)); // hashed file should exist when build succeeds
  });
});
