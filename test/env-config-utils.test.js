/*
 * ENV CONFIG UTILITY TESTING - ENVIRONMENT VARIABLE PARSERS
 *
 * PURPOSE AND RATIONALE:
 * This suite validates the helper functions in scripts/utils/env-config.js.
 * These functions centralize environment variable parsing across the codebase
 * so correctness here ensures consistent configuration handling.
 *
 * TESTING STRATEGY:
 * - Validate integer, string, and boolean parsing with valid input.
 * - Verify out-of-range and malformed values fall back to defaults.
 * - Confirm missing environment variables return provided defaults.
 */

require('./helper'); // ensures axios/qerrors stubs are active for isolation
const assert = require('node:assert'); // Node.js assertion library for test validation
const {describe, it, beforeEach, afterEach} = require('node:test'); // test framework components

const {parseEnvInt, parseEnvString, parseEnvBool, trimTrailingSlashes} = require('../scripts/utils/env-config'); // functions under test including url normalizer

let originalEnv; // snapshot of original environment

beforeEach(() => {
  originalEnv = {...process.env}; // preserve original environment for restoration
  process.env.CODEX = 'True'; // force offline mode to match project testing standard
});

afterEach(() => {
  process.env = {...originalEnv}; // restore original environment state after each test
});

/*
 * INTEGER PARSER VALIDATION
 */
describe('parseEnvInt behavior', {concurrency:false}, () => {
  it('returns numeric value within range', () => {
    process.env.TEST_INT = '10'; // set valid environment variable
    const result = parseEnvInt('TEST_INT', 5, 1, 20); // parse with range 1-20
    assert.strictEqual(result, 10); // should match provided value
  });

  it('falls back when value outside range', () => {
    process.env.TEST_INT = '25'; // value exceeds max 20
    const result = parseEnvInt('TEST_INT', 5, 1, 20); // parse with range enforcement
    assert.strictEqual(result, 5); // default should be used
  });

  it('falls back on malformed value', () => {
    process.env.TEST_INT = 'notanumber'; // invalid numeric string
    const result = parseEnvInt('TEST_INT', 5, 1, 20); // parse with same range
    assert.strictEqual(result, 5); // default returned on parse failure
  });

  it('returns default when variable missing', () => {
    delete process.env.TEST_INT; // ensure variable not set
    const result = parseEnvInt('TEST_INT', 5, 1, 20); // parse without env variable
    assert.strictEqual(result, 5); // default applied when missing
  });
});

/*
 * STRING PARSER VALIDATION
 */
describe('parseEnvString behavior', {concurrency:false}, () => {
  it('returns provided string value', () => {
    process.env.TEST_STR = 'value'; // set environment variable
    const result = parseEnvString('TEST_STR', 'default'); // parse string
    assert.strictEqual(result, 'value'); // should match provided value
  });

  it('trims leading and trailing spaces', () => {
    process.env.TEST_STR = '   spaced value   '; // variable with extra spaces
    const result = parseEnvString('TEST_STR', 'default'); // parse trimmed
    assert.strictEqual(result, 'spaced value'); // should trim whitespace
  });

  it('returns default when variable missing', () => {
    delete process.env.TEST_STR; // ensure variable not present
    const result = parseEnvString('TEST_STR', 'default'); // parse without env var
    assert.strictEqual(result, 'default'); // default returned
  });
});

/*
 * BOOLEAN PARSER VALIDATION
 */
describe('parseEnvBool behavior', {concurrency:false}, () => {
  it('parses true and false values', () => {
    process.env.TEST_BOOL = 'true'; // set true value
    assert.strictEqual(parseEnvBool('TEST_BOOL', false), true); // expect true
    process.env.TEST_BOOL = 'false'; // change to false
    assert.strictEqual(parseEnvBool('TEST_BOOL', true), false); // expect false
  });

  it('falls back on invalid value', () => {
    process.env.TEST_BOOL = 'invalid'; // not a boolean string
    const result = parseEnvBool('TEST_BOOL', true); // parse with default true
    assert.strictEqual(result, true); // default should be used
  });

  it('returns default when variable missing', () => {
    delete process.env.TEST_BOOL; // ensure variable missing
    const result = parseEnvBool('TEST_BOOL', false); // parse without env var
    assert.strictEqual(result, false); // default applied
  });
});

/*
 * TRAILING SLASH TRIM UTILITY VALIDATION
 */
describe('trimTrailingSlashes behavior', {concurrency:false}, () => {
  it('removes extra trailing slashes from url', () => {
    const result = trimTrailingSlashes('http://cdn///'); // url with multiple slashes
    assert.strictEqual(result, 'http://cdn'); // should drop trailing characters
  });
});
