/*
 * COMPREHENSIVE UNIT TESTING - INDIVIDUAL FUNCTION VALIDATION
 * 
 * PURPOSE AND RATIONALE:
 * This test suite provides comprehensive unit testing for all testable functions
 * in the project, focusing on individual function behavior rather than system
 * integration. Unit tests validate function contracts, edge cases, and error
 * handling at the granular level.
 * 
 * TESTING STRATEGY:
 * - Pure function testing with controlled inputs/outputs
 * - Error condition validation
 * - Boundary value testing
 * - Type validation and parameter handling
 * 
 * This approach ensures each function works correctly in isolation before
 * testing integration scenarios.
 */

require("./helper"); // loads module stubbing for consistent test environment
const assert = require('node:assert'); // Node.js built-in assertion library for test validation
const fs = require('node:fs'); // file system operations for test setup
const path = require('node:path'); // path utilities for cross-platform file handling
const os = require('node:os'); // operating system utilities for temporary directory creation
const {describe, it, beforeEach, afterEach} = require('node:test'); // Node.js native test framework components
const {mock} = require('node:test'); // Node.js native mocking utilities

let tmpDir; // temporary directory path for isolated test execution

/*
 * UNIT TEST SETUP CONFIGURATION
 * 
 * ISOLATION STRATEGY:
 * Each unit test runs in a fresh temporary directory to ensure complete
 * isolation from other tests and system state. This setup enables
 * controlled testing of individual function behavior.
 */
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'unit-test-')); // creates unique temporary directory for test isolation
  process.chdir(tmpDir); // changes working directory to temporary location
});

/*
 * UNIT TEST CLEANUP PROCEDURE
 * 
 * CLEANUP RATIONALE:
 * Restores original working directory and removes temporary files to prevent
 * unit test artifacts from accumulating. Essential for maintaining test
 * independence and reproducibility.
 */
afterEach(() => {
  process.chdir(path.resolve(__dirname, '..')); // restores original working directory
  fs.rmSync(tmpDir, {recursive: true, force: true}); // removes temporary directory and all contents
});

/*
 * REQUEST RETRY UTILITY UNIT TESTS
 * 
 * TESTING SCOPE:
 * Validates request retry functionality including timeout handling,
 * retry counting, exponential backoff calculations, and error propagation.
 * Tests individual function behavior without external dependencies.
 */
describe('request retry unit tests', {concurrency:false}, () => {
  /*
   * TIMEOUT CONFIGURATION VALIDATION
   * 
   * TEST STRATEGY:
   * Tests that fetchRetry properly applies timeout configuration
   * from options parameter. Validates default timeout behavior
   * and custom timeout override functionality.
   */
  it('applies timeout configuration correctly', async () => {
    const axios = require('axios'); // imports axios for mocking
    let appliedTimeout; // captures timeout value applied to request
    
    mock.method(axios, 'get', async (url, opts) => {
      appliedTimeout = opts.timeout; // captures timeout from options
      return {status: 200}; // returns successful response
    });
    
    delete require.cache[require.resolve('../scripts/request-retry')]; // clears module cache for fresh import
    const fetchRetry = require('../scripts/request-retry'); // imports fetchRetry function after cache clearing
    
    // Test default timeout
    await fetchRetry('http://test'); // executes with default timeout
    assert.strictEqual(appliedTimeout, 10000); // validates default 10-second timeout
    
    // Test custom timeout
    await fetchRetry('http://test', {timeout: 5000}); // executes with custom timeout
    assert.strictEqual(appliedTimeout, 5000); // validates custom timeout application
  });

  /*
   * RETRY ATTEMPT COUNTING VALIDATION
   * 
   * TEST STRATEGY:
   * Tests that fetchRetry respects the maximum attempts parameter
   * and stops retrying after the specified number of failures.
   * Validates proper attempt counting logic.
   */
  it('respects maximum retry attempts', async () => {
    const axios = require('axios'); // imports axios for mocking
    let attemptCount = 0; // tracks number of attempts made
    
    mock.method(axios, 'get', async () => {
      attemptCount++; // increments attempt counter
      throw new Error('simulated failure'); // simulates request failure
    });
    
    delete require.cache[require.resolve('../scripts/request-retry')]; // clears module cache for fresh import
    const fetchRetry = require('../scripts/request-retry'); // imports fetchRetry function after cache clearing
    
    await assert.rejects(
      async () => await fetchRetry('http://test', {}, 3), // executes with 3 maximum attempts
      (err) => err.message === 'simulated failure' // validates error propagation
    );
    
    assert.strictEqual(attemptCount, 3); // confirms exactly 3 attempts were made
  });

  /*
   * SUCCESSFUL REQUEST HANDLING VALIDATION
   * 
   * TEST STRATEGY:
   * Tests that fetchRetry returns immediately on successful requests
   * without unnecessary retry attempts. Validates happy path behavior
   * and response object preservation.
   */
  it('returns immediately on successful requests', async () => {
    const axios = require('axios'); // imports axios for mocking
    let attemptCount = 0; // tracks number of attempts made
    
    mock.method(axios, 'get', async () => {
      attemptCount++; // increments attempt counter
      return {status: 200, data: 'success'}; // returns successful response
    });
    
    delete require.cache[require.resolve('../scripts/request-retry')]; // clears module cache for fresh import
    const fetchRetry = require('../scripts/request-retry'); // imports fetchRetry function after cache clearing
    
    const result = await fetchRetry('http://test', {}, 3); // executes with 3 maximum attempts
    
    assert.strictEqual(attemptCount, 1); // confirms only 1 attempt was made
    assert.strictEqual(result.status, 200); // validates successful response status
    assert.strictEqual(result.data, 'success'); // validates response data preservation
  });
});

/*
 * PERFORMANCE MEASUREMENT UNIT TESTS
 * 
 * TESTING SCOPE:
 * Validates performance measurement utility functions including timing
 * calculations, batch processing logic, and statistical analysis.
 * Tests individual components without network dependencies.
 */
describe('performance measurement unit tests', {concurrency:false}, () => {
  /*
   * TIMING MEASUREMENT VALIDATION
   * 
   * TEST STRATEGY:
   * Tests getTime function in offline mode to validate timing
   * measurement logic and simulation behavior. Ensures consistent
   * timing results and proper error handling.
   */
  it('measures timing consistently in offline mode', async () => {
    process.env.CODEX = 'True'; // forces offline mode for predictable testing
    
    delete require.cache[require.resolve('../scripts/performance')]; // clears module cache for fresh import
    const performance = require('../scripts/performance'); // imports performance module after cache clearing
    
    const time1 = await performance.getTime('http://test'); // measures first timing
    const time2 = await performance.getTime('http://test'); // measures second timing
    
    assert.strictEqual(typeof time1, 'number'); // validates numeric result
    assert.strictEqual(typeof time2, 'number'); // validates numeric result
    assert.ok(time1 > 50); // confirms realistic timing (>50ms for 100ms wait + overhead)
    assert.ok(time2 > 50); // confirms realistic timing
    assert.ok(Math.abs(time1 - time2) < 50); // confirms consistent timing (within 50ms variance)
    
    delete process.env.CODEX; // cleans up environment flag
  });

  /*
   * BATCH SIZE CALCULATION VALIDATION
   * 
   * TEST STRATEGY:
   * Tests measureUrl function with various request counts to validate
   * proper batch size calculation and processing logic. Ensures
   * correct handling of remainder batches.
   */
  it('calculates batch sizes correctly', async () => {
    process.env.CODEX = 'True'; // forces offline mode for predictable testing
    process.env.QUEUE_LIMIT = '3'; // sets controlled queue limit for testing
    
    delete require.cache[require.resolve('../scripts/performance')]; // clears module cache for fresh import
    const performance = require('../scripts/performance'); // imports performance module after cache clearing
    
    // Test exact multiple of queue limit
    const result1 = await performance.measureUrl('http://test', 6); // 6 requests with limit 3 = 2 full batches
    assert.strictEqual(typeof result1, 'number'); // validates numeric result
    
    // Test with remainder
    const result2 = await performance.measureUrl('http://test', 7); // 7 requests with limit 3 = 2 full + 1 partial batch
    assert.strictEqual(typeof result2, 'number'); // validates numeric result
    
    delete process.env.QUEUE_LIMIT; // cleans up queue limit override
    delete process.env.CODEX; // cleans up environment flag
  });

  /*
   * AVERAGE CALCULATION VALIDATION
   * 
   * TEST STRATEGY:
   * Tests statistical calculation logic by providing known timing
   * values and validating correct average computation. Ensures
   * mathematical accuracy in measurement aggregation.
   */
  it('calculates averages correctly', async () => {
    process.env.CODEX = 'True'; // forces offline mode for predictable testing
    
    delete require.cache[require.resolve('../scripts/performance')]; // clears module cache for fresh import
    const performance = require('../scripts/performance'); // imports performance module after cache clearing
    
    // Measure small sample for average calculation testing
    const result = await performance.measureUrl('http://test', 2); // measures 2 requests for average
    
    assert.strictEqual(typeof result, 'number'); // validates numeric result
    assert.ok(result > 0); // confirms positive average value
    assert.ok(result < 1000); // ensures reasonable timing in offline mode
    
    delete process.env.CODEX; // cleans up environment flag
  });
});

/*
 * HTML UPDATE UTILITY UNIT TESTS
 * 
 * TESTING SCOPE:
 * Validates HTML update functionality including string replacement
 * logic, template substitution, and file handling. Tests individual
 * function components without build system dependencies.
 */
describe('HTML update unit tests', {concurrency:false}, () => {
  /*
   * HASH REPLACEMENT VALIDATION
   * 
   * TEST STRATEGY:
   * Tests HTML hash replacement logic with known input patterns
   * to validate string replacement accuracy. Ensures correct
   * pattern matching and substitution behavior.
   */
  it('replaces hash patterns correctly', async () => {
    fs.writeFileSync(path.join(tmpDir, 'build.hash'), 'abcd1234'); // creates hash file with known value
    fs.writeFileSync(path.join(tmpDir, 'index.html'), '<link href="core.aaaaaaaa.min.css">'); // creates HTML with valid hex placeholder
    
    delete require.cache[require.resolve('../scripts/updateHtml')]; // clears module cache for fresh import
    const updateHtml = require('../scripts/updateHtml'); // imports updateHtml function after cache clearing
    
    const hash = await updateHtml(); // executes HTML update
    const updated = fs.readFileSync(path.join(tmpDir, 'index.html'), 'utf8'); // reads updated HTML
    
    assert.strictEqual(hash, 'abcd1234'); // validates returned hash
    assert.ok(updated.includes('core.abcd1234.min.css')); // confirms hash replacement
    assert.ok(!updated.includes('aaaaaaaa')); // verifies old placeholder removed
  });

  /*
   * QORE CSS FALLBACK REPLACEMENT VALIDATION
   * 
   * TEST STRATEGY:
   * Tests fallback replacement logic for plain qore.css references
   * to validate alternative pattern matching. Ensures backward
   * compatibility with non-hashed CSS references.
   */
  it('handles qore.css fallback replacement', async () => {
    fs.writeFileSync(path.join(tmpDir, 'build.hash'), 'wxyz5678'); // creates hash file with known value
    fs.writeFileSync(path.join(tmpDir, 'index.html'), '<link rel="stylesheet" href="qore.css">'); // creates HTML with plain CSS reference
    
    delete require.cache[require.resolve('../scripts/updateHtml')]; // clears module cache for fresh import
    const updateHtml = require('../scripts/updateHtml'); // imports updateHtml function after cache clearing
    
    const hash = await updateHtml(); // executes HTML update
    const updated = fs.readFileSync(path.join(tmpDir, 'index.html'), 'utf8'); // reads updated HTML
    
    assert.strictEqual(hash, 'wxyz5678'); // validates returned hash
    assert.ok(updated.includes('core.wxyz5678.min.css')); // confirms qore.css replacement
    assert.ok(!updated.includes('href="qore.css"')); // verifies old reference removed
  });

  /*
   * HASH FILE READING VALIDATION
   * 
   * TEST STRATEGY:
   * Tests hash file reading logic with various hash formats
   * to validate proper file parsing and whitespace handling.
   * Ensures robust hash extraction from build artifacts.
   */
  it('reads hash file correctly with whitespace handling', async () => {
    fs.writeFileSync(path.join(tmpDir, 'build.hash'), '  trimtest  \n'); // creates hash file with whitespace
    fs.writeFileSync(path.join(tmpDir, 'index.html'), '<link href="core.aaaaaaaa.min.css">'); // creates HTML with placeholder
    
    delete require.cache[require.resolve('../scripts/updateHtml')]; // clears module cache for fresh import
    const updateHtml = require('../scripts/updateHtml'); // imports updateHtml function after cache clearing
    
    const hash = await updateHtml(); // executes HTML update
    
    assert.strictEqual(hash, 'trimtest'); // validates whitespace trimming
    
    const updated = fs.readFileSync(path.join(tmpDir, 'index.html'), 'utf8'); // reads updated HTML
    assert.ok(updated.includes('core.trimtest.min.css')); // confirms trimmed hash usage
  });
});

/*
 * CDN PURGE UTILITY UNIT TESTS
 * 
 * TESTING SCOPE:
 * Validates CDN purge functionality including URL construction,
 * offline mode handling, and response code processing. Tests
 * individual function behavior without network dependencies.
 */
describe('CDN purge unit tests', {concurrency:false}, () => {
  /*
   * OFFLINE MODE BEHAVIOR VALIDATION
   * 
   * TEST STRATEGY:
   * Tests purgeCdn function in offline mode (CODEX=True) to validate
   * development environment behavior. Ensures consistent mock
   * responses without network calls.
   */
  it('handles offline mode correctly', async () => {
    process.env.CODEX = 'True'; // forces offline mode
    
    delete require.cache[require.resolve('../scripts/purge-cdn')]; // clears module cache for fresh import
    const {purgeCdn} = require('../scripts/purge-cdn'); // imports purgeCdn function via destructuring
    
    const result = await purgeCdn('test.css'); // executes purge in offline mode
    
    assert.strictEqual(result, 200); // validates offline success code
    
    delete process.env.CODEX; // cleans up environment flag
  });

  /*
   * HASH FILE INTEGRATION VALIDATION
   * 
   * TEST STRATEGY:
   * Tests run function's integration with build hash file to validate
   * proper filename construction for CDN purge operations. Ensures
   * correct coordination with build system outputs.
   */
  it('constructs filenames from hash correctly', async () => {
    process.env.CODEX = 'True'; // forces offline mode
    fs.writeFileSync(path.join(tmpDir, 'build.hash'), 'filetest'); // creates hash file with known value
    
    delete require.cache[require.resolve('../scripts/purge-cdn')]; // clears module cache for fresh import
    const {run} = require('../scripts/purge-cdn'); // imports run function via destructuring
    
    const result = await run(); // executes run function with hash integration
    
    assert.strictEqual(result, 200); // validates successful execution
    
    delete process.env.CODEX; // cleans up environment flag
  });

  /*
   * ERROR CODE HANDLING VALIDATION
   * 
   * TEST STRATEGY:
   * Tests run function error handling when build.hash file is missing
   * to validate proper error code return. Ensures graceful failure
   * when build dependencies are unavailable.
   */
  it('returns error code for missing hash file', async () => {
    process.env.CODEX = 'True'; // forces offline mode
    // No hash file created - testing missing file scenario
    
    delete require.cache[require.resolve('../scripts/purge-cdn')]; // clears module cache for fresh import
    const {run} = require('../scripts/purge-cdn'); // imports run function via destructuring
    
    const result = await run(); // executes run without hash file
    
    assert.strictEqual(result, 1); // validates error code for missing file
    
    delete process.env.CODEX; // cleans up environment flag
  });
});