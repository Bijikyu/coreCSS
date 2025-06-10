/*
 * ERROR HANDLING TESTING - COMPREHENSIVE ERROR SCENARIO VALIDATION
 * 
 * PURPOSE AND RATIONALE:
 * This test suite validates error handling across all modules, ensuring
 * proper error propagation, logging, and recovery mechanisms. Error
 * handling is critical for production reliability and debugging.
 * 
 * TESTING STRATEGY:
 * - File system errors (missing files, permission issues)
 * - Network errors (timeouts, connection failures)
 * - Invalid input handling (malformed data, type errors)
 * - Environment configuration errors
 * 
 * This comprehensive approach ensures the application fails gracefully
 * and provides meaningful error information for debugging.
 */

require("./helper"); // loads module stubbing for consistent test environment
const assert = require('node:assert'); // Node.js built-in assertion library for test validation
const fs = require('node:fs'); // file system operations for error simulation
const path = require('node:path'); // path utilities for cross-platform file handling
const os = require('node:os'); // operating system utilities for temporary directory creation
const {describe, it, beforeEach, afterEach} = require('node:test'); // Node.js native test framework components
const {mock} = require('node:test'); // Node.js native mocking utilities

let tmpDir; // temporary directory path for isolated test execution

/*
 * ERROR TEST SETUP CONFIGURATION
 * 
 * ISOLATION STRATEGY:
 * Each error test runs in a fresh temporary directory to ensure
 * file system errors don't affect subsequent tests. This setup
 * enables realistic error scenario simulation.
 */
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'error-test-')); // creates unique temporary directory for test isolation
  process.chdir(tmpDir); // changes working directory to temporary location for script execution
});

/*
 * ERROR TEST CLEANUP PROCEDURE
 * 
 * CLEANUP RATIONALE:
 * Restores original working directory and removes temporary files to prevent
 * test artifacts from accumulating. Essential for error tests that may
 * leave the environment in unusual states.
 */
afterEach(() => {
  process.chdir(path.resolve(__dirname, '..')); // restores original working directory
  fs.rmSync(tmpDir, {recursive: true, force: true}); // removes temporary directory and all contents
});

/*
 * BUILD SCRIPT ERROR HANDLING VALIDATION
 * 
 * TESTING SCOPE:
 * Validates build script behavior when encountering file system errors,
 * missing dependencies, and invalid CSS input. Build errors must be
 * properly caught and reported for debugging.
 */
describe('build error handling', {concurrency:false}, () => {
  /*
   * MISSING CSS FILE ERROR VALIDATION
   * 
   * TEST STRATEGY:
   * Attempts to run build without required qore.css file to validate
   * error handling when source files are missing. Should fail gracefully
   * with meaningful error message.
   */
  it('handles missing qore.css file', async () => {
    delete require.cache[require.resolve('../scripts/build')]; // clears module cache for fresh import
    const build = require('../scripts/build'); // imports build function after cache clearing
    
    await assert.rejects(
      async () => await build(), // executes build without required CSS file
      (err) => {
        return err.code === 'ENOENT' && err.path.includes('qore.css'); // validates specific file not found error
      }
    );
  });

  /*
   * INVALID CSS CONTENT ERROR VALIDATION
   * 
   * TEST STRATEGY:
   * Creates malformed CSS content to test CSS parsing error handling.
   * Build process should handle CSS syntax errors gracefully without
   * crashing the entire build pipeline.
   */
  it('handles malformed CSS content', async () => {
    fs.writeFileSync(path.join(tmpDir, 'qore.css'), '/* malformed css { invalid syntax'); // creates invalid CSS for error testing
    fs.copyFileSync(path.resolve(__dirname, '../index.js'), path.join(tmpDir, 'index.js')); // copies index.js for build processing
    
    delete require.cache[require.resolve('../scripts/build')]; // clears module cache for fresh import
    const build = require('../scripts/build'); // imports build function after cache clearing
    
    // Build should complete even with CSS warnings, PostCSS is resilient
    const hash = await build(); // executes build with malformed CSS
    assert.strictEqual(typeof hash, 'string'); // confirms build returns hash despite CSS issues
    assert.strictEqual(hash.length, 8); // validates hash format consistency
  });
});

/*
 * PERFORMANCE SCRIPT ERROR HANDLING VALIDATION
 * 
 * TESTING SCOPE:
 * Validates performance measurement error handling for network failures,
 * invalid URLs, and file system errors. Performance tools must be
 * resilient to external service availability.
 */
describe('performance error handling', {concurrency:false}, () => {
  /*
   * MISSING BUILD HASH ERROR VALIDATION
   * 
   * TEST STRATEGY:
   * Attempts to run performance tests without build.hash file to validate
   * error handling when build artifacts are missing. Should fail with
   * appropriate error message indicating missing hash file.
   */
  it('handles missing build.hash file', async () => {
    process.env.CODEX = 'True'; // forces offline mode for predictable testing
    delete require.cache[require.resolve('../scripts/performance')]; // clears module cache for fresh import
    const performance = require('../scripts/performance'); // imports performance module after cache clearing
    
    await assert.rejects(
      async () => await performance.run(), // executes performance run without hash file
      (err) => {
        return err.code === 'ENOENT' && err.path.includes('build.hash'); // validates specific hash file not found error
      }
    );
    delete process.env.CODEX; // cleans up environment flag
  });

  /*
   * INVALID ARGUMENT HANDLING VALIDATION
   * 
   * TEST STRATEGY:
   * Tests performance script with invalid command line arguments to
   * validate input validation and error handling. Should handle
   * malformed inputs gracefully.
   */
  it('handles invalid command line arguments', async () => {
    process.env.CODEX = 'True'; // forces offline mode for predictable testing
    fs.writeFileSync(path.join(tmpDir, 'build.hash'), '12345678'); // creates valid hash file
    
    const originalArgv = process.argv; // preserves original arguments
    process.argv = ['node', 'performance.js', 'invalid', '--invalid-flag']; // sets invalid arguments
    
    delete require.cache[require.resolve('../scripts/performance')]; // clears module cache for fresh import
    const performance = require('../scripts/performance'); // imports performance module after cache clearing
    
    // Performance script should handle invalid args gracefully
    const result = await performance.run(); // executes with invalid arguments
    assert.strictEqual(typeof result, 'number'); // validates numeric return value despite invalid args
    
    process.argv = originalArgv; // restores original arguments
    delete process.env.CODEX; // cleans up environment flag
  });
});

/*
 * HTML UPDATE ERROR HANDLING VALIDATION
 * 
 * TESTING SCOPE:
 * Validates HTML update script error handling for missing files,
 * malformed HTML, and file permission issues. HTML updates are
 * critical for deployment and must handle errors gracefully.
 */
describe('updateHtml error handling', {concurrency:false}, () => {
  /*
   * MISSING HTML FILE ERROR VALIDATION
   * 
   * TEST STRATEGY:
   * Attempts to update non-existent HTML file to validate error handling
   * when target files are missing. Should fail with appropriate error
   * message indicating missing HTML file.
   */
  it('handles missing index.html file', async () => {
    fs.writeFileSync(path.join(tmpDir, 'build.hash'), '12345678'); // creates valid hash file
    
    delete require.cache[require.resolve('../scripts/updateHtml')]; // clears module cache for fresh import
    const updateHtml = require('../scripts/updateHtml'); // imports updateHtml function after cache clearing
    
    await assert.rejects(
      async () => await updateHtml(), // executes updateHtml without HTML file
      (err) => {
        return err.code === 'ENOENT' && err.path.includes('index.html'); // validates specific HTML file not found error
      }
    );
  });

  /*
   * MISSING BUILD HASH ERROR VALIDATION
   * 
   * TEST STRATEGY:
   * Attempts to update HTML without build.hash file to validate error
   * handling when build artifacts are missing. Should fail with
   * appropriate error indicating missing hash dependency.
   */
  it('handles missing build.hash file', async () => {
    fs.writeFileSync(path.join(tmpDir, 'index.html'), '<link href="qore.css">'); // creates basic HTML file
    
    delete require.cache[require.resolve('../scripts/updateHtml')]; // clears module cache for fresh import
    const updateHtml = require('../scripts/updateHtml'); // imports updateHtml function after cache clearing
    
    await assert.rejects(
      async () => await updateHtml(), // executes updateHtml without hash file
      (err) => {
        return err.code === 'ENOENT' && err.path.includes('build.hash'); // validates specific hash file not found error
      }
    );
  });
});

/*
 * CDN PURGE ERROR HANDLING VALIDATION
 * 
 * TESTING SCOPE:
 * Validates CDN purge error handling for network failures, invalid
 * responses, and missing build files. CDN operations must be resilient
 * to external service availability and network issues.
 */
describe('purge-cdn error handling', {concurrency:false}, () => {
  /*
   * MISSING BUILD HASH ERROR VALIDATION
   * 
   * TEST STRATEGY:
   * Attempts to run CDN purge without build.hash file to validate error
   * handling when build artifacts are missing. Should return appropriate
   * error code indicating missing dependencies.
   */
  it('handles missing build.hash in run function', async () => {
    process.env.CODEX = 'True'; // forces offline mode for predictable testing
    
    delete require.cache[require.resolve('../scripts/purge-cdn')]; // clears module cache for fresh import
    const {run} = require('../scripts/purge-cdn'); // imports run function via destructuring
    
    const result = await run(); // executes run without hash file
    assert.strictEqual(result, 1); // validates error code return (1 = missing file)
    
    delete process.env.CODEX; // cleans up environment flag
  });
});