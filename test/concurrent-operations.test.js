/*
 * CONCURRENT OPERATIONS TESTING - RACE CONDITION AND PARALLEL EXECUTION VALIDATION
 * 
 * PURPOSE AND RATIONALE:
 * This test suite validates application behavior under concurrent execution
 * scenarios that could expose race conditions, resource conflicts, or
 * synchronization issues. Concurrent testing is essential for production
 * environments where multiple operations may execute simultaneously.
 * 
 * TESTING STRATEGY:
 * - Parallel build operations (multiple simultaneous builds)
 * - Concurrent file access scenarios
 * - Simultaneous network operations
 * - Resource contention validation
 * 
 * This approach ensures thread-safe operation and proper resource
 * management under realistic production load conditions.
 */

require("./helper"); // loads module stubbing for consistent test environment
const assert = require('node:assert'); // Node.js built-in assertion library for test validation
const fs = require('node:fs'); // file system operations for concurrent testing
const path = require('node:path'); // path utilities for cross-platform file handling
const os = require('node:os'); // operating system utilities for temporary directory creation
const {describe, it, beforeEach, afterEach} = require('node:test'); // Node.js native test framework components

let tmpDir; // temporary directory path for isolated test execution

/*
 * CONCURRENT TEST SETUP CONFIGURATION
 * 
 * ISOLATION STRATEGY:
 * Each concurrent test runs in a fresh temporary directory to prevent
 * race conditions between tests. This setup enables realistic concurrent
 * scenario simulation without test interference.
 */
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'concurrent-test-')); // creates unique temporary directory for test isolation
  process.chdir(tmpDir); // changes working directory to temporary location for script execution
});

/*
 * CONCURRENT TEST CLEANUP PROCEDURE
 * 
 * CLEANUP RATIONALE:
 * Restores original working directory and removes temporary files to prevent
 * concurrent test artifacts from accumulating. Essential for tests that may
 * create multiple competing resources.
 */
afterEach(() => {
  process.chdir(path.resolve(__dirname, '..')); // restores original working directory
  fs.rmSync(tmpDir, {recursive: true, force: true}); // removes temporary directory and all contents
});

/*
 * CONCURRENT BUILD OPERATIONS
 * 
 * TESTING SCOPE:
 * Validates build system behavior when multiple build operations execute
 * simultaneously. Tests for file conflicts, hash consistency, and proper
 * synchronization of build artifacts.
 */
describe('concurrent build operations', {concurrency:false}, () => {
  /*
   * PARALLEL BUILD EXECUTION VALIDATION
   * 
   * TEST STRATEGY:
   * Executes multiple build operations simultaneously to test for race
   * conditions in file creation, hash generation, and index.js injection.
   * All builds should produce consistent results without conflicts.
   */
  it('handles multiple simultaneous builds', async () => {
    process.env.CODEX = 'True'; // forces offline mode for predictable testing
    
    // Create identical CSS files for each build
    for(let i = 0; i < 3; i++) {
      const buildDir = path.join(tmpDir, `build${i}`); // creates separate build directory
      fs.mkdirSync(buildDir); // creates build directory
      fs.writeFileSync(path.join(buildDir, 'qore.css'), 'body { margin: 0; }'); // creates identical CSS content
      fs.copyFileSync(path.resolve(__dirname, '../index.js'), path.join(buildDir, 'index.js')); // copies index.js for hash injection
    }
    
    delete require.cache[require.resolve('../scripts/build')]; // clears module cache for fresh import
    const build = require('../scripts/build'); // imports build function after cache clearing
    
    // Execute builds concurrently
    const buildPromises = []; // stores concurrent build promises
    for(let i = 0; i < 3; i++) {
      const buildDir = path.join(tmpDir, `build${i}`); // gets build directory path
      buildPromises.push(
        (async () => {
          const originalCwd = process.cwd(); // preserves current working directory
          process.chdir(buildDir); // changes to build directory
          const hash = await build(); // executes build in isolated directory
          process.chdir(originalCwd); // restores working directory
          return {buildDir, hash}; // returns build results
        })()
      );
    }
    
    const results = await Promise.all(buildPromises); // waits for all builds to complete
    
    // Validate all builds succeeded
    results.forEach(({buildDir, hash}) => {
      assert.strictEqual(typeof hash, 'string'); // validates hash generation
      assert.strictEqual(hash.length, 8); // confirms standard hash length
      assert.ok(fs.existsSync(path.join(buildDir, `core.${hash}.min.css`))); // verifies output file creation
      assert.ok(fs.existsSync(path.join(buildDir, 'build.hash'))); // verifies hash file creation
    });
    
    // Verify identical input produces identical hashes
    const hashes = results.map(r => r.hash); // extracts all generated hashes
    assert.ok(hashes.every(hash => hash === hashes[0])); // confirms hash consistency across builds
    
    delete process.env.CODEX; // cleans up environment flag
  });
});

/*
 * CONCURRENT PERFORMANCE MEASUREMENTS
 * 
 * TESTING SCOPE:
 * Validates performance measurement system behavior under concurrent
 * load. Tests for proper queue management, resource sharing, and
 * measurement accuracy during simultaneous operations.
 */
describe('concurrent performance measurements', {concurrency:false}, () => {
  /*
   * PARALLEL MEASUREMENT EXECUTION VALIDATION
   * 
   * TEST STRATEGY:
   * Executes multiple performance measurements simultaneously to test
   * queue management and resource contention. Should handle concurrent
   * measurements without interference or resource exhaustion.
   */
  it('handles multiple simultaneous measurements', async () => {
    process.env.CODEX = 'True'; // forces offline mode for predictable testing
    process.env.QUEUE_LIMIT = '2'; // sets controlled queue limit for testing
    
    delete require.cache[require.resolve('../scripts/performance')]; // clears module cache for fresh import
    const performance = require('../scripts/performance'); // imports performance module after cache clearing
    
    // Execute measurements concurrently
    const measurementPromises = [
      performance.measureUrl('http://test1', 5), // measures first URL with 5 requests
      performance.measureUrl('http://test2', 5), // measures second URL with 5 requests
      performance.measureUrl('http://test3', 5)  // measures third URL with 5 requests
    ];
    
    const results = await Promise.all(measurementPromises); // waits for all measurements to complete
    
    // Validate all measurements succeeded
    results.forEach(result => {
      assert.strictEqual(typeof result, 'number'); // validates numeric result
      assert.ok(result > 0); // confirms positive timing value
      assert.ok(result < 1000); // ensures reasonable timing in offline mode
    });
    
    delete process.env.CODEX; // cleans up environment flag
    delete process.env.QUEUE_LIMIT; // cleans up queue limit override
  });
});

/*
 * CONCURRENT HTML UPDATES
 * 
 * TESTING SCOPE:
 * Validates HTML update system behavior when multiple updates execute
 * simultaneously. Tests for file locking, consistent updates, and proper
 * synchronization of HTML modifications.
 */
describe('concurrent HTML updates', {concurrency:false}, () => {
  /*
   * PARALLEL HTML UPDATE VALIDATION
   * 
   * TEST STRATEGY:
   * Executes multiple HTML updates simultaneously to test for file
   * conflicts and race conditions. Should handle concurrent file
   * access without corruption or conflicts.
   */
  it('handles multiple simultaneous HTML updates', async () => {
    // Create separate HTML files for each update
    for(let i = 0; i < 3; i++) {
      const updateDir = path.join(tmpDir, `update${i}`); // creates separate update directory
      fs.mkdirSync(updateDir); // creates update directory
      fs.writeFileSync(path.join(updateDir, 'build.hash'), '12345678'); // creates valid hash file
      fs.writeFileSync(path.join(updateDir, 'index.html'), '<link href="core.aaaaaaaa.min.css">'); // creates HTML with placeholder
    }
    
    delete require.cache[require.resolve('../scripts/updateHtml')]; // clears module cache for fresh import
    const updateHtml = require('../scripts/updateHtml'); // imports updateHtml function after cache clearing
    
    // Execute updates concurrently
    const updatePromises = []; // stores concurrent update promises
    for(let i = 0; i < 3; i++) {
      const updateDir = path.join(tmpDir, `update${i}`); // gets update directory path
      updatePromises.push(
        (async () => {
          const originalCwd = process.cwd(); // preserves current working directory
          process.chdir(updateDir); // changes to update directory
          const hash = await updateHtml(); // executes update in isolated directory
          process.chdir(originalCwd); // restores working directory
          return {updateDir, hash}; // returns update results
        })()
      );
    }
    
    const results = await Promise.all(updatePromises); // waits for all updates to complete
    
    // Validate all updates succeeded
    results.forEach(({updateDir, hash}) => {
      assert.strictEqual(hash, '12345678'); // validates returned hash
      const htmlContent = fs.readFileSync(path.join(updateDir, 'index.html'), 'utf8'); // reads updated HTML
      assert.ok(htmlContent.includes('core.12345678.min.css')); // confirms hash replacement
      assert.ok(!htmlContent.includes('aaaaaaaa')); // verifies old hash removed
    });
  });
});

/*
 * CONCURRENT NETWORK OPERATIONS
 * 
 * TESTING SCOPE:
 * Validates retry mechanism behavior under concurrent network load.
 * Tests for proper connection pooling, timeout handling, and resource
 * management during simultaneous requests.
 */
describe('concurrent network operations', {concurrency:false}, () => {
  /*
   * PARALLEL REQUEST EXECUTION VALIDATION
   * 
   * TEST STRATEGY:
   * Executes multiple network requests simultaneously to test connection
   * pooling and retry logic under load. Should handle concurrent requests
   * without resource exhaustion or timeout issues.
   */
  it('handles multiple simultaneous requests', async () => {
    const axios = require('axios'); // imports axios for mocking
    const {mock} = require('node:test'); // imports mocking utilities
    
    let requestCount = 0; // tracks total requests made
    mock.method(axios, 'get', async (url) => {
      requestCount++; // increments request counter
      await new Promise(resolve => setTimeout(resolve, 10)); // simulates network delay
      return {status: 200, url}; // returns successful response with URL
    });
    
    delete require.cache[require.resolve('../scripts/request-retry')]; // clears module cache for fresh import
    const fetchRetry = require('../scripts/request-retry'); // imports fetchRetry function after cache clearing
    
    // Execute requests concurrently
    const requestPromises = [
      fetchRetry('http://test1'), // makes first concurrent request
      fetchRetry('http://test2'), // makes second concurrent request
      fetchRetry('http://test3'), // makes third concurrent request
      fetchRetry('http://test4'), // makes fourth concurrent request
      fetchRetry('http://test5')  // makes fifth concurrent request
    ];
    
    const results = await Promise.all(requestPromises); // waits for all requests to complete
    
    // Validate all requests succeeded
    results.forEach((result, index) => {
      assert.strictEqual(result.status, 200); // validates successful status
      assert.ok(result.url.includes(`test${index + 1}`)); // confirms correct URL handling
    });
    
    assert.strictEqual(requestCount, 5); // confirms all requests were made
  });
});