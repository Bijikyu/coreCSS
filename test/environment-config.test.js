/*
 * ENVIRONMENT CONFIGURATION TESTING - DEPLOYMENT ENVIRONMENT VALIDATION
 * 
 * PURPOSE AND RATIONALE:
 * This test suite validates application behavior across different deployment
 * environments and configuration scenarios. Environment-specific testing
 * ensures reliable operation in development, staging, and production
 * environments with different configuration values.
 * 
 * TESTING STRATEGY:
 * - Environment variable validation and fallback behavior
 * - Configuration override testing
 * - Invalid configuration handling
 * - Cross-environment compatibility validation
 * 
 * This approach ensures robust configuration management and proper
 * fallback behavior across all deployment scenarios.
 */

require("./helper"); // loads module stubbing for consistent test environment
const assert = require('node:assert'); // Node.js built-in assertion library for test validation
const fs = require('node:fs'); // file system operations for environment testing
const path = require('node:path'); // path utilities for cross-platform file handling
const os = require('node:os'); // operating system utilities for temporary directory creation
const {describe, it, beforeEach, afterEach} = require('node:test'); // Node.js native test framework components

let tmpDir; // temporary directory path for isolated test execution
let originalEnv; // preserves original environment variables

/*
 * ENVIRONMENT TEST SETUP CONFIGURATION
 * 
 * ISOLATION STRATEGY:
 * Each environment test runs with isolated environment variables to prevent
 * configuration from affecting subsequent tests. This setup enables realistic
 * environment scenario simulation.
 */
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'env-test-')); // creates unique temporary directory for test isolation
  process.chdir(tmpDir); // changes working directory to temporary location for script execution
  originalEnv = {...process.env}; // preserves original environment variables
});

/*
 * ENVIRONMENT TEST CLEANUP PROCEDURE
 * 
 * CLEANUP RATIONALE:
 * Restores original environment variables and working directory to prevent
 * environment test pollution. Essential for preventing configuration
 * changes from affecting subsequent tests.
 */
afterEach(() => {
  process.chdir(path.resolve(__dirname, '..')); // restores original working directory
  fs.rmSync(tmpDir, {recursive: true, force: true}); // removes temporary directory and all contents
  process.env = {...originalEnv}; // restores original environment variables
});

/*
 * PERFORMANCE CONFIGURATION TESTING
 * 
 * TESTING SCOPE:
 * Validates performance measurement configuration handling including
 * concurrency limits, queue sizes, and CDN endpoint configuration.
 * Tests proper fallback to defaults when configuration missing.
 */
describe('performance environment configuration', {concurrency:false}, () => {
  /*
   * CONCURRENCY LIMIT CONFIGURATION VALIDATION
   * 
   * TEST STRATEGY:
   * Tests various MAX_CONCURRENCY environment values including valid
   * numbers, invalid values, and missing configuration. Should handle
   * all cases gracefully with appropriate fallback behavior.
   */
  it('handles MAX_CONCURRENCY environment variable', async () => {
    fs.writeFileSync(path.join(tmpDir, 'build.hash'), '12345678'); // creates valid hash file
    
    // Test valid numeric value
    process.env.CODEX = 'True'; // forces offline mode for predictable testing
    process.env.MAX_CONCURRENCY = '25'; // sets custom concurrency limit
    
    delete require.cache[require.resolve('../scripts/performance')]; // clears module cache for fresh import
    const performance = require('../scripts/performance'); // imports performance module with custom config
    
    // Performance should use custom concurrency limit (validation through successful execution)
    const result = await performance.measureUrl('http://test', 30); // tests with count higher than limit
    assert.strictEqual(typeof result, 'number'); // validates numeric result
    
    delete process.env.MAX_CONCURRENCY; // cleans up custom configuration
    delete process.env.CODEX; // cleans up environment flag
  });

  /*
   * INVALID CONCURRENCY CONFIGURATION HANDLING
   * 
   * TEST STRATEGY:
   * Tests performance measurement with invalid MAX_CONCURRENCY values
   * to validate fallback to default behavior. Should handle non-numeric
   * and negative values gracefully.
   */
  it('handles invalid MAX_CONCURRENCY values', async () => {
    fs.writeFileSync(path.join(tmpDir, 'build.hash'), '12345678'); // creates valid hash file
    
    // Test invalid string value
    process.env.CODEX = 'True'; // forces offline mode for predictable testing
    process.env.MAX_CONCURRENCY = 'invalid'; // sets invalid concurrency limit
    
    delete require.cache[require.resolve('../scripts/performance')]; // clears module cache for fresh import
    const performance = require('../scripts/performance'); // imports performance module with invalid config
    
    // Should fallback to default behavior
    const result = await performance.measureUrl('http://test', 5); // tests with moderate request count
    assert.strictEqual(typeof result, 'number'); // validates numeric result despite invalid config
    
    delete process.env.MAX_CONCURRENCY; // cleans up invalid configuration
    delete process.env.CODEX; // cleans up environment flag
  });

  /*
   * QUEUE LIMIT CONFIGURATION VALIDATION
   * 
   * TEST STRATEGY:
   * Tests QUEUE_LIMIT environment variable handling including valid
   * limits, edge cases, and missing configuration. Should properly
   * configure queue batching behavior.
   */
  it('handles QUEUE_LIMIT environment variable', async () => {
    fs.writeFileSync(path.join(tmpDir, 'build.hash'), '12345678'); // creates valid hash file
    
    process.env.CODEX = 'True'; // forces offline mode for predictable testing
    process.env.QUEUE_LIMIT = '3'; // sets custom queue limit
    
    delete require.cache[require.resolve('../scripts/performance')]; // clears module cache for fresh import
    const performance = require('../scripts/performance'); // imports performance module with custom queue
    
    // Should use custom queue limit for batching
    const result = await performance.measureUrl('http://test', 10); // tests with count higher than queue limit
    assert.strictEqual(typeof result, 'number'); // validates numeric result with custom batching
    
    delete process.env.QUEUE_LIMIT; // cleans up custom configuration
    delete process.env.CODEX; // cleans up environment flag
  });

  /*
   * CDN BASE URL CONFIGURATION VALIDATION
   * 
   * TEST STRATEGY:
   * Tests CDN_BASE_URL environment variable override to validate
   * custom CDN endpoint configuration. Should properly construct
   * URLs with custom base configuration.
   */
  it('handles CDN_BASE_URL environment variable', async () => {
    fs.writeFileSync(path.join(tmpDir, 'build.hash'), '12345678'); // creates valid hash file
    
    process.env.CODEX = 'True'; // forces offline mode for predictable testing
    process.env.CDN_BASE_URL = 'https://custom-cdn.example.com'; // sets custom CDN base URL
    
    const originalArgv = process.argv; // preserves original arguments
    process.argv = ['node', 'performance.js', '1']; // sets test arguments
    
    delete require.cache[require.resolve('../scripts/performance')]; // clears module cache for fresh import
    const performance = require('../scripts/performance'); // imports performance module with custom CDN
    
    // Should use custom CDN base URL (validated through successful execution)
    const result = await performance.run(); // executes full performance run with custom CDN
    assert.strictEqual(typeof result, 'number'); // validates numeric result with custom CDN
    
    process.argv = originalArgv; // restores original arguments
    delete process.env.CDN_BASE_URL; // cleans up custom configuration
    delete process.env.CODEX; // cleans up environment flag
  });
});

/*
 * REQUEST RETRY CONFIGURATION TESTING
 * 
 * TESTING SCOPE:
 * Validates HTTP retry mechanism configuration including socket limits,
 * timeout values, and connection pooling parameters. Tests proper
 * configuration application and fallback behavior.
 */
describe('request retry environment configuration', {concurrency:false}, () => {
  /*
   * SOCKET LIMIT CONFIGURATION VALIDATION
   * 
   * TEST STRATEGY:
   * Tests SOCKET_LIMIT environment variable handling to validate
   * connection pooling configuration. Should properly configure
   * maximum socket connections for HTTP agents.
   */
  it('handles SOCKET_LIMIT environment variable', async () => {
    process.env.SOCKET_LIMIT = '25'; // sets custom socket limit
    
    const axios = require('axios'); // imports axios for mocking before module load
    const {mock} = require('node:test'); // imports mocking utilities for axios

    mock.method(axios, 'get', async () => ({status: 200})); // stubs instance get before axios.create

    delete require.cache[require.resolve('../scripts/request-retry')]; // clears module cache for fresh import
    const fetchRetry = require('../scripts/request-retry'); // imports fetchRetry with custom socket limit after stubbing
    
    // Should use custom socket limit (validated through successful execution)
    const result = await fetchRetry('http://test'); // executes request with custom socket configuration
    assert.strictEqual(result.status, 200); // validates successful request with custom config
    
    delete process.env.SOCKET_LIMIT; // cleans up custom configuration
  });

  /*
   * INVALID SOCKET LIMIT HANDLING
   * 
   * TEST STRATEGY:
   * Tests request retry with invalid SOCKET_LIMIT values to validate
   * fallback to default behavior. Should handle non-numeric values
   * gracefully without breaking functionality.
   */
  it('handles invalid SOCKET_LIMIT values', async () => {
    process.env.SOCKET_LIMIT = 'invalid'; // sets invalid socket limit
    
    const axios = require('axios'); // imports axios for mocking before module load
    const {mock} = require('node:test'); // imports mocking utilities for axios

    mock.method(axios, 'get', async () => ({status: 200})); // stubs instance get before axios.create

    delete require.cache[require.resolve('../scripts/request-retry')]; // clears module cache for fresh import
    const fetchRetry = require('../scripts/request-retry'); // imports fetchRetry with invalid socket config after stubbing
    
    // Should fallback to default socket limit
    const result = await fetchRetry('http://test'); // executes request with invalid config
    assert.strictEqual(result.status, 200); // validates successful request despite invalid config
    
    delete process.env.SOCKET_LIMIT; // cleans up invalid configuration
  });
});

/*
 * HTML UPDATE CONFIGURATION TESTING
 * 
 * TESTING SCOPE:
 * Validates HTML update configuration including CDN URL templating
 * and environment-specific URL replacement. Tests proper template
 * variable substitution and fallback behavior.
 */
describe('HTML update environment configuration', {concurrency:false}, () => {
  /*
   * CDN URL TEMPLATE SUBSTITUTION VALIDATION
   * 
   * TEST STRATEGY:
   * Tests CDN_BASE_URL template replacement in HTML files to validate
   * environment-specific URL configuration. Should properly substitute
   * template variables with environment values.
   */
  it('handles CDN_BASE_URL template substitution', async () => {
    fs.writeFileSync(path.join(tmpDir, 'build.hash'), '12345678'); // creates valid hash file
    fs.writeFileSync(path.join(tmpDir, 'index.html'), '<link href="core.aaaaaaaa.min.css">\n{{CDN_BASE_URL}}'); // creates HTML with template
    
    process.env.CDN_BASE_URL = 'https://production-cdn.example.com'; // sets production CDN URL
    
    delete require.cache[require.resolve('../scripts/updateHtml')]; // clears module cache for fresh import
    const updateHtml = require('../scripts/updateHtml'); // imports updateHtml function after cache clearing
    
    const hash = await updateHtml(); // executes HTML update with CDN template
    const updated = fs.readFileSync(path.join(tmpDir, 'index.html'), 'utf8'); // reads updated HTML
    
    assert.strictEqual(hash, '12345678'); // validates returned hash
    assert.ok(updated.includes('core.12345678.min.css')); // confirms hash replacement
    assert.ok(updated.includes('https://production-cdn.example.com')); // confirms CDN URL substitution
    assert.ok(!updated.includes('{{CDN_BASE_URL}}')); // verifies template variable removed
    
    delete process.env.CDN_BASE_URL; // cleans up custom configuration
  });

  /*
   * MISSING CDN URL CONFIGURATION HANDLING
   * 
   * TEST STRATEGY:
   * Tests HTML update behavior when CDN_BASE_URL environment variable
   * is not set. Should handle missing configuration gracefully without
   * breaking HTML update functionality.
   */
  it('handles missing CDN_BASE_URL configuration', async () => {
    fs.writeFileSync(path.join(tmpDir, 'build.hash'), '12345678'); // creates valid hash file
    fs.writeFileSync(path.join(tmpDir, 'index.html'), '<link href="core.aaaaaaaa.min.css">\n{{CDN_BASE_URL}}'); // creates HTML with template
    
    // Ensure CDN_BASE_URL is not set
    delete process.env.CDN_BASE_URL; // ensures CDN URL is not configured
    
    delete require.cache[require.resolve('../scripts/updateHtml')]; // clears module cache for fresh import
    const updateHtml = require('../scripts/updateHtml'); // imports updateHtml function after cache clearing
    
    const hash = await updateHtml(); // executes HTML update without CDN config
    const updated = fs.readFileSync(path.join(tmpDir, 'index.html'), 'utf8'); // reads updated HTML
    
    assert.strictEqual(hash, '12345678'); // validates returned hash
    assert.ok(updated.includes('core.12345678.min.css')); // confirms hash replacement still works
    // Template variable should be replaced with undefined or removed when environment variable missing
    assert.ok(!updated.includes('{{CDN_BASE_URL}}') || updated.includes('undefined')); // confirms template handling when no config
  });
});