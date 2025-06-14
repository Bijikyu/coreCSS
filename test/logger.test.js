/*
 * LOGGER UTILITY TESTING - DEPENDENCY FALLBACK VALIDATION
 *
 * PURPOSE AND RATIONALE:
 * Validates that scripts/utils/logger correctly prefers the qerrors module
 * when present but falls back to console.error when qerrors is unavailable.
 * Reliable logging is critical for debugging across all environments.
 */

require('./helper'); // ensures base stubs and resolution behavior
const assert = require('node:assert'); // assertion library for validation
const Module = require('module'); // module system for require interception
const {describe, it} = require('node:test'); // test framework components
const {mock} = require('node:test'); // mocking utilities for spying

/*
 * QERRORS MODULE STUB TESTING
 *
 * TESTING SCOPE:
 * Temporarily overrides Module.prototype.require so that requiring 'qerrors'
 * returns a custom stub. The logger module should export this stub when
 * available, demonstrating dependency injection capability.
 */
describe('logger uses qerrors when available', {concurrency:false}, () => {
  it('exports the stubbed qerrors function', () => {
    const orig = Module.prototype.require; // preserve existing require behavior
    const stub = () => {}; // custom qerrors stub function for test
    Module.prototype.require = function(id){ // override require during module load
      if(id==='qerrors') return stub; // returns stub when qerrors requested
      return orig.call(this,id); // otherwise defer to original require
    };
    delete require.cache[require.resolve('../scripts/utils/logger')]; // clear cache for fresh load
    const logger = require('../scripts/utils/logger'); // load logger with stubbed dependency
    Module.prototype.require = orig; // restore require to avoid test interference
    assert.strictEqual(logger, stub); // verify export matches provided stub
  });
});

/*
 * FALLBACK LOGGER BEHAVIOR TESTING
 *
 * TESTING SCOPE:
 * Simulates absence of the qerrors module by throwing MODULE_NOT_FOUND when
 * qerrors is required. The logger should then fall back to console.error.
 */
describe('logger falls back without qerrors', {concurrency:false}, () => {
  it('logs via console.error when qerrors is missing', () => {
    const orig = Module.prototype.require; // preserve current require behavior
    Module.prototype.require = function(id){ // override to simulate missing module
      if(id==='qerrors'){ // when logger tries to require qerrors
        const err = new Error("Cannot find module 'qerrors'"); // mimic resolution error
        err.code = 'MODULE_NOT_FOUND'; // standard node error code
        throw err; // trigger fallback path
      }
      return orig.call(this,id); // normal require for other modules
    };
    delete require.cache[require.resolve('../scripts/utils/logger')]; // clear cache for fresh load
    const logger = require('../scripts/utils/logger'); // load logger with missing qerrors
    Module.prototype.require = orig; // restore require after module load
    const spy = mock.method(console, 'error', ()=>{}); // spy on console.error calls
    logger('boom','msg'); // invoke logger to trigger console.error
    assert.strictEqual(spy.mock.callCount(),1); // ensure console.error was called once
    assert.strictEqual(spy.mock.calls[0].arguments[0],'boom'); // validate error argument passed
  });
});
