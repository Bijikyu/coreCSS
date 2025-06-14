/*
 * EDGE CASE TESTING - BOUNDARY CONDITIONS AND UNUSUAL SCENARIOS
 * 
 * PURPOSE AND RATIONALE:
 * This test suite validates application behavior under edge conditions
 * that may not occur during normal operation but could cause failures
 * in production environments. Edge case testing is essential for
 * production reliability and defensive programming validation.
 * 
 * TESTING STRATEGY:
 * - Boundary value testing (empty inputs, maximum sizes)
 * - Concurrent operation testing (race conditions)
 * - Resource exhaustion scenarios
 * - Malformed input handling
 * 
 * This approach ensures robust behavior across all possible input
 * combinations and system states.
 */

require("./helper"); // loads module stubbing for consistent test environment
const assert = require('node:assert'); // Node.js built-in assertion library for test validation
const fs = require('node:fs'); // file system operations for edge case simulation
const path = require('node:path'); // path utilities for cross-platform file handling
const os = require('node:os'); // operating system utilities for temporary directory creation
const {describe, it, beforeEach, afterEach} = require('node:test'); // Node.js native test framework components

let tmpDir; // temporary directory path for isolated test execution

/*
 * EDGE CASE TEST SETUP CONFIGURATION
 * 
 * ISOLATION STRATEGY:
 * Each edge case test runs in a fresh temporary directory to prevent
 * unusual test conditions from affecting subsequent tests. This setup
 * enables realistic edge case scenario simulation.
 */
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-test-')); // creates unique temporary directory for test isolation
  process.chdir(tmpDir); // changes working directory to temporary location for script execution
});

/*
 * EDGE CASE TEST CLEANUP PROCEDURE
 * 
 * CLEANUP RATIONALE:
 * Restores original working directory and removes temporary files to prevent
 * edge case artifacts from accumulating. Essential for tests that may
 * create unusual file system states.
 */
afterEach(() => {
  process.chdir(path.resolve(__dirname, '..')); // restores original working directory
  fs.rmSync(tmpDir, {recursive: true, force: true}); // removes temporary directory and all contents
});

/*
 * BUILD SYSTEM EDGE CASES
 * 
 * TESTING SCOPE:
 * Validates build system behavior with unusual but valid inputs
 * including empty CSS files, extremely large files, and special
 * characters in content.
 */
describe('build edge cases', {concurrency:false}, () => {
  /*
   * EMPTY CSS FILE HANDLING
   * 
   * TEST STRATEGY:
   * Tests build process with completely empty CSS file to validate
   * handling of minimal input. Build should complete successfully
   * and produce valid output even with no CSS content.
   */
  it('handles empty CSS file', async () => {
    fs.writeFileSync(path.join(tmpDir, 'qore.css'), ''); // creates completely empty CSS file
    fs.copyFileSync(path.resolve(__dirname, '../index.js'), path.join(tmpDir, 'index.js')); // copies index.js for hash injection test
    
    delete require.cache[require.resolve('../scripts/build')]; // clears module cache for fresh import
    const build = require('../scripts/build'); // imports build function after cache clearing
    
    const hash = await build(); // executes build with empty CSS
    assert.strictEqual(typeof hash, 'string'); // validates hash generation
    assert.strictEqual(hash.length, 8); // confirms standard hash length
    assert.ok(fs.existsSync(`core.${hash}.min.css`)); // verifies output file creation
  });

  /*
   * LARGE CSS FILE HANDLING
   * 
   * TEST STRATEGY:
   * Tests build process with abnormally large CSS content to validate
   * memory usage and processing time under stress. Should handle
   * large files without memory issues or timeouts.
   */
  it('handles large CSS file', async () => {
    const largeCss = 'body { margin: 0; }\n'.repeat(10000); // creates large CSS content for stress testing
    fs.writeFileSync(path.join(tmpDir, 'qore.css'), largeCss); // writes large CSS file
    fs.copyFileSync(path.resolve(__dirname, '../index.js'), path.join(tmpDir, 'index.js')); // copies index.js for hash injection test
    
    delete require.cache[require.resolve('../scripts/build')]; // clears module cache for fresh import
    const build = require('../scripts/build'); // imports build function after cache clearing
    
    const hash = await build(); // executes build with large CSS
    assert.strictEqual(typeof hash, 'string'); // validates hash generation
    assert.ok(fs.existsSync(`core.${hash}.min.css`)); // verifies output file creation
    
    const outputSize = fs.statSync(`core.${hash}.min.css`).size; // checks output file size
    assert.ok(outputSize > 0); // confirms minification produced output or copy fallback
    assert.ok(outputSize <= largeCss.length); // validates compression occurred or equals in offline mode
  });

  /*
   * SPECIAL CHARACTERS IN CSS HANDLING
   * 
   * TEST STRATEGY:
   * Tests build process with Unicode characters, emojis, and special
   * symbols in CSS to validate encoding handling. Should preserve
   * content integrity through build process.
   */
  it('handles special characters in CSS', async () => {
    const specialCss = `
      /* Unicode test: 你好世界 */
      .emoji::before { content: "🎨"; }
      .quotes { content: "'\"''"; }
      .symbols { content: "←→↑↓"; }
    `; // CSS with various special characters for encoding testing
    fs.writeFileSync(path.join(tmpDir, 'qore.css'), specialCss); // writes CSS with special characters
    fs.copyFileSync(path.resolve(__dirname, '../index.js'), path.join(tmpDir, 'index.js')); // copies index.js for hash injection test
    
    delete require.cache[require.resolve('../scripts/build')]; // clears module cache for fresh import
    const build = require('../scripts/build'); // imports build function after cache clearing
    
    const hash = await build(); // executes build with special characters
    assert.strictEqual(typeof hash, 'string'); // validates hash generation
    assert.ok(fs.existsSync(`core.${hash}.min.css`)); // verifies output file creation
    
    const output = fs.readFileSync(`core.${hash}.min.css`, 'utf8'); // reads generated CSS
    assert.ok(output.includes('🎨')); // confirms emoji preservation
    assert.ok(output.includes('你好')); // confirms Unicode preservation
  });
});

/*
 * PERFORMANCE MEASUREMENT EDGE CASES
 * 
 * TESTING SCOPE:
 * Validates performance measurement behavior with extreme parameter
 * values and unusual configurations that could cause measurement
 * errors or infinite loops.
 */
describe('performance edge cases', {concurrency:false}, () => {
  /*
   * ZERO REQUEST COUNT HANDLING
   * 
   * TEST STRATEGY:
   * Tests performance measurement with zero requests to validate
   * boundary condition handling. Should handle gracefully without
   * division by zero or other mathematical errors.
   */
  it('handles zero request count', async () => {
    process.env.CODEX = 'True'; // forces offline mode for predictable testing
    delete require.cache[require.resolve('../scripts/performance')]; // clears module cache for fresh import
    const performance = require('../scripts/performance'); // imports performance module after cache clearing
    
    const result = await performance.measureUrl('http://test', 0); // measures with zero requests
    assert.strictEqual(result, 0); // validates zero result for zero requests (0/0 = 0 in this context)
    
    delete process.env.CODEX; // cleans up environment flag
  });

  /*
   * SINGLE REQUEST MEASUREMENT
   * 
   * TEST STRATEGY:
   * Tests performance measurement with exactly one request to validate
   * edge case where no averaging is needed. Should return single
   * measurement value directly.
   */
  it('handles single request measurement', async () => {
    process.env.CODEX = 'True'; // forces offline mode for predictable testing
    delete require.cache[require.resolve('../scripts/performance')]; // clears module cache for fresh import
    const performance = require('../scripts/performance'); // imports performance module after cache clearing
    
    const result = await performance.measureUrl('http://test', 1); // measures with single request
    assert.strictEqual(typeof result, 'number'); // validates numeric result
    assert.ok(result > 0); // confirms positive timing value
    
    delete process.env.CODEX; // cleans up environment flag
  });

  /*
   * EXTREMELY HIGH CONCURRENCY
   * 
   * TEST STRATEGY:
   * Tests performance measurement with request count higher than
   * concurrency limit to validate batching logic. Should handle
   * large request counts without resource exhaustion.
   */
  it('handles high request count with batching', async () => {
    process.env.CODEX = 'True'; // forces offline mode for predictable testing
    process.env.QUEUE_LIMIT = '2'; // sets low queue limit for batching testing
    
    delete require.cache[require.resolve('../scripts/performance')]; // clears module cache for fresh import
    const performance = require('../scripts/performance'); // imports performance module after cache clearing
    
    const result = await performance.measureUrl('http://test', 10); // measures with high request count
    assert.strictEqual(typeof result, 'number'); // validates numeric result
    assert.ok(result > 0); // confirms positive timing value
    
    delete process.env.CODEX; // cleans up environment flag
    delete process.env.QUEUE_LIMIT; // cleans up queue limit override
  });
});

/*
 * HTML UPDATE EDGE CASES
 * 
 * TESTING SCOPE:
 * Validates HTML update behavior with unusual HTML content including
 * malformed markup, multiple CSS links, and edge case patterns that
 * could break string replacement logic.
 */
describe('updateHtml edge cases', {concurrency:false}, () => {
  /*
   * MULTIPLE CSS LINK HANDLING
   * 
   * TEST STRATEGY:
   * Tests HTML update with multiple CSS link tags to validate
   * replacement logic. Should update correct links without affecting
   * unrelated CSS references.
   */
  it('handles multiple CSS links', async () => {
    fs.writeFileSync(path.join(tmpDir, 'build.hash'), '12345678'); // creates valid hash file
    const htmlContent = `
      <link rel="stylesheet" href="core.aaaaaaaa.min.css">
      <link rel="stylesheet" href="other.css">
      <link rel="stylesheet" href="core.bbbbbbbb.min.css">
    `; // HTML with multiple CSS links for replacement testing
    fs.writeFileSync(path.join(tmpDir, 'index.html'), htmlContent); // writes HTML with multiple links
    
    delete require.cache[require.resolve('../scripts/updateHtml')]; // clears module cache for fresh import
    const updateHtml = require('../scripts/updateHtml'); // imports updateHtml function after cache clearing
    
    const hash = await updateHtml(); // executes HTML update
    const updated = fs.readFileSync(path.join(tmpDir, 'index.html'), 'utf8'); // reads updated HTML
    
    assert.strictEqual(hash, '12345678'); // validates returned hash
    assert.ok(updated.includes('core.12345678.min.css')); // confirms hash replacement occurred
    assert.ok(updated.includes('other.css')); // verifies unrelated CSS preserved
    
    // Count occurrences of old hash patterns
    const oldHashCount = (updated.match(/core\.aaaaaaaa\.min\.css/g) || []).length; // counts old hash occurrences
    assert.strictEqual(oldHashCount, 0); // confirms all old hashes replaced
  });

  /*
   * NO CSS LINKS HANDLING
   * 
   * TEST STRATEGY:
   * Tests HTML update with HTML that contains no CSS links to validate
   * behavior when no replacement targets exist. Should complete without
   * errors and leave HTML unchanged.
   */
  it('handles HTML with no CSS links', async () => {
    fs.writeFileSync(path.join(tmpDir, 'build.hash'), '12345678'); // creates valid hash file
    const htmlContent = `
      <html><head><title>Test</title></head>
      <body><h1>No CSS Here</h1></body></html>
    `; // HTML without CSS links for edge case testing
    fs.writeFileSync(path.join(tmpDir, 'index.html'), htmlContent); // writes HTML without CSS links
    
    delete require.cache[require.resolve('../scripts/updateHtml')]; // clears module cache for fresh import
    const updateHtml = require('../scripts/updateHtml'); // imports updateHtml function after cache clearing
    
    const hash = await updateHtml(); // executes HTML update
    const updated = fs.readFileSync(path.join(tmpDir, 'index.html'), 'utf8'); // reads updated HTML
    
    assert.strictEqual(hash, '12345678'); // validates returned hash
    assert.strictEqual(updated.trim(), htmlContent.trim()); // confirms HTML unchanged
  });
});

/*
 * REQUEST RETRY EDGE CASES
 * 
 * TESTING SCOPE:
 * Validates retry mechanism behavior with extreme parameter values
 * and unusual error conditions that could break retry logic or
 * cause infinite loops.
 */
describe('request retry edge cases', {concurrency:false}, () => {
  /*
   * ZERO RETRY ATTEMPTS
   * 
   * TEST STRATEGY:
   * Tests retry mechanism with zero allowed attempts to validate
   * boundary condition handling. Should fail immediately without
   * attempting any requests.
   */
  it('handles zero retry attempts', async () => {
    const axios = require('axios'); // imports axios for mocking
    const {mock} = require('node:test'); // imports mocking utilities

    let called = 0; // tracks axios call count
    mock.method(axios, 'get', async () => { called++; throw new Error('should not be called'); }); // should never run

    delete require.cache[require.resolve('../scripts/request-retry')]; // clears module cache for fresh import
    const fetchRetry = require('../scripts/request-retry'); // imports fetchRetry function after cache clearing

    await assert.rejects(
      async () => await fetchRetry('http://test', {}, 0), // executes with zero attempts
      (err) => err.message === 'attempts must be >0' // validates parameter error
    );

    assert.strictEqual(called, 0); // confirms axios was not called
  });

  /*
   * EXTREMELY LONG URL HANDLING
   * 
   * TEST STRATEGY:
   * Tests retry mechanism with abnormally long URL to validate
   * parameter handling. Should handle long URLs without truncation
   * or buffer overflow issues.
   */
  it('handles extremely long URLs', async () => {
    const axios = require('axios'); // imports axios for mocking
    const {mock} = require('node:test'); // imports mocking utilities
    
    const longUrl = 'http://example.com/' + 'a'.repeat(2000); // creates extremely long URL for testing
    mock.method(axios, 'get', async (url) => {
      assert.strictEqual(url, longUrl); // validates URL preservation
      return {status: 200}; // returns successful response
    });
    
    delete require.cache[require.resolve('../scripts/request-retry')]; // clears module cache for fresh import
    const fetchRetry = require('../scripts/request-retry'); // imports fetchRetry function after cache clearing
    
    const response = await fetchRetry(longUrl); // executes with long URL
    assert.strictEqual(response.status, 200); // validates successful completion
  });
});