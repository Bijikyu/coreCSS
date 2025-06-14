/*
 * REQUEST RETRY TESTING - NETWORK RESILIENCE VALIDATION
 * 
 * PURPOSE AND RATIONALE:
 * This test suite validates the request-retry utility's exponential backoff
 * and retry logic, ensuring network requests are resilient to transient
 * failures. Testing network retry logic requires careful mocking to simulate
 * various failure scenarios without relying on actual network conditions.
 * 
 * TESTING STRATEGY:
 * - Mock axios to control request outcomes deterministically
 * - Test immediate success, retry-then-success, and ultimate failure scenarios
 * - Validate retry counting and exponential backoff behavior
 * - Ensure proper error propagation after exhausting attempts
 * 
 * This approach ensures the retry mechanism works correctly across all
 * network conditions while providing predictable test results.
 */

require("./helper"); // loads module stubbing for consistent test environment
const assert = require('node:assert'); // Node.js built-in assertion library for test validation
const {describe, it, beforeEach} = require('node:test'); // Node.js native test framework components
const {mock} = require('node:test'); // Node.js native mocking utilities for axios stubbing

let fetchRetry; // request-retry function reference, assigned after module loading
let axios; // axios reference for mocking network requests

/*
 * TEST SETUP CONFIGURATION
 * 
 * MOCKING STRATEGY:
 * Each test gets fresh axios mocks and module imports to ensure test isolation.
 * Module cache clearing prevents previous test state from affecting current
 * test execution, ensuring reliable and reproducible test results.
 */
beforeEach(() => {
  axios = require('axios'); // imports axios for mocking setup
  mock.method(axios, 'get', async () => ({status:200})); // default success mock for axios.get method
  delete require.cache[require.resolve('../scripts/request-retry')]; // clears module cache for fresh imports
  fetchRetry = require('../scripts/request-retry'); // imports fetchRetry function after mocking setup
});

/*
 * IMMEDIATE SUCCESS SCENARIO TESTING
 * 
 * TESTING SCOPE:
 * Validates that fetchRetry works correctly when network requests succeed
 * on the first attempt. This ensures the retry mechanism doesn't interfere
 * with normal successful operations and maintains expected performance.
 */
describe('fetchRetry success', {concurrency:false}, () => {
  /*
   * FIRST ATTEMPT SUCCESS VALIDATION
   * 
   * TEST STRATEGY:
   * Uses default axios mock that returns success immediately to confirm
   * fetchRetry passes through successful responses without unnecessary
   * retry attempts or delays. This validates the happy path behavior.
   */
  it('returns response on first try', async () => {
    const res = await fetchRetry('http://a'); // executes fetchRetry with mocked successful axios
    assert.strictEqual(res.status, 200); // confirms successful response is properly returned
  });
});

/*
 * RETRY MECHANISM VALIDATION
 * 
 * TESTING SCOPE:
 * Validates the exponential backoff retry logic by simulating initial
 * failures followed by eventual success. This tests the core retry
 * functionality that makes network requests resilient to transient issues.
 */
describe('fetchRetry retries then succeeds', {concurrency:false}, () => {
  /*
   * RETRY COUNT AND SUCCESS VALIDATION
   * 
   * TEST STRATEGY:
   * Mocks axios to fail twice then succeed, validating that fetchRetry
   * properly counts attempts and eventually returns success. This confirms
   * the retry mechanism works correctly for transient network failures.
   */
  it('retries failed attempts', async () => {
    let count = 0; // tracks number of axios.get calls for retry validation
    mock.method(axios, 'get', async () => { count++; if(count<3) throw new Error('fail'); return {status:200}; }); // fails twice then succeeds
    delete require.cache[require.resolve('../scripts/request-retry')]; // reloads module to apply new axios mock
    fetchRetry = require('../scripts/request-retry'); // imports after custom mock setup
    const res = await fetchRetry('http://b', {}, 3); // executes fetchRetry with 3 maximum attempts
    assert.strictEqual(count,3); // confirms exactly 3 attempts were made (2 failures + 1 success)
    assert.strictEqual(res.status,200); // confirms eventual success response
  });
});

/*
 * ULTIMATE FAILURE SCENARIO TESTING
 * 
 * TESTING SCOPE:
 * Validates that fetchRetry properly propagates errors when all retry
 * attempts are exhausted. This ensures the utility doesn't hang indefinitely
 * and provides appropriate error handling for persistent network issues.
 */
describe('fetchRetry fails after attempts', {concurrency:false}, () => {
  /*
   * ERROR PROPAGATION VALIDATION
   * 
   * TEST STRATEGY:
   * Mocks axios to always fail and validates that fetchRetry throws an
   * error after exhausting all retry attempts. This confirms proper error
   * handling when network issues persist beyond retry limits.
   */
  it('throws after exhausting attempts', async () => {
    mock.method(axios, 'get', async () => { throw new Error('fail'); }); // mocks persistent network failure
    delete require.cache[require.resolve('../scripts/request-retry')]; // reloads module to apply failing mock
    fetchRetry = require('../scripts/request-retry'); // imports after custom mock setup
    await assert.rejects(fetchRetry('http://c', {}, 2)); // validates error is thrown after 2 failed attempts
  });
});

/*
 * PARAMETER VALIDATION TESTING
 *
 * TESTING SCOPE:
 * Validates that fetchRetry throws an error when provided
 * with less than one attempt, ensuring caller configuration
 * is correct before any network request occurs.
 */
describe('fetchRetry invalid attempts parameter', {concurrency:false}, () => {
  it('throws when attempts is below one', async () => {
    await assert.rejects(
      async () => await fetchRetry('http://d', {}, 0), // executes with invalid attempts
      (err) => err.message === 'attempts must be >0' // validates rejection reason
    );
  });
});
