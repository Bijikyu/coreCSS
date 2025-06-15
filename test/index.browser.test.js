/*
 * BROWSER INJECTION TESTING - DOM ENVIRONMENT SIMULATION
 * 
 * PURPOSE AND RATIONALE:
 * This test suite validates the browser-specific behavior of the index.js module,
 * specifically the automatic CSS injection functionality that occurs when the
 * module detects a browser environment (presence of window object). Testing
 * requires DOM simulation since Node.js lacks native browser APIs.
 * 
 * TESTING STRATEGY:
 * - JSDOM provides realistic browser environment simulation
 * - Global window/document injection enables browser detection
 * - CSS injection validation ensures automatic stylesheet loading works
 * - Graceful fallback when JSDOM unavailable prevents test failures
 * 
 * This approach ensures the npm package works correctly when loaded directly
 * in browser environments via script tags or browser bundles.
 */

require("./helper"); // loads module stubbing for consistent test environment
const assert = require('node:assert'); // Node.js built-in assertion library for test validation
const path = require('node:path'); // path utilities for cross-platform file handling
const {describe, it, beforeEach, afterEach} = require('node:test'); // Node.js native test framework components
let JSDOM; // will hold jsdom constructor when available for DOM simulation
try { ({JSDOM} = require('jsdom')); } catch { JSDOM = null; } // fallback when jsdom missing to prevent import errors

let dom; // JSDOM instance for browser environment simulation
let mod; // module reference, assigned after DOM setup to ensure browser detection

/*
 * BROWSER ENVIRONMENT SETUP
 * 
 * DOM SIMULATION STRATEGY:
 * Creates a minimal HTML document with JSDOM and exposes window/document
 * globally to trigger the module's browser detection logic. This setup
 * enables testing of CSS injection without requiring an actual browser.
 */
beforeEach(() => {
  if(!JSDOM) return; // skips setup when jsdom unavailable to prevent test failures
  dom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`); // creates DOM for browser simulation
  global.window = dom.window; // exposes window for module browser detection
  global.document = dom.window.document; // exposes document for CSS injection functionality
  process.chdir(path.resolve(__dirname, '..')); // ensures correct module paths for file resolution
  delete require.cache[require.resolve('../index.js')]; // reloads module for clean state after DOM setup
  mod = require('../index.js'); // imports module after DOM setup to trigger browser behavior
});

/*
 * BROWSER ENVIRONMENT CLEANUP
 * 
 * CLEANUP RATIONALE:
 * Removes global DOM objects and closes JSDOM instance to prevent test
 * environment pollution and ensure subsequent tests run in clean Node.js
 * environment without browser globals.
 */
afterEach(() => {
  if(!JSDOM) return; // skips teardown when jsdom unavailable
  dom.window.close(); // closes jsdom window to free resources
  delete global.window; // removes global window to restore Node.js environment
  delete global.document; // removes global document to restore Node.js environment
});

/*
 * BROWSER BEHAVIOR VALIDATION
 * 
 * TESTING SCOPE:
 * Validates that the module correctly detects browser environment and
 * automatically injects CSS without setting server-side flags. This ensures
 * the zero-configuration browser experience works as intended.
 */
describe('browser injection', {concurrency:false}, () => {
  /*
   * GRACEFUL FALLBACK FOR MISSING DEPENDENCIES
   * 
   * FALLBACK RATIONALE:
   * When JSDOM is not available (optional dependency), tests should skip
   * gracefully rather than fail. This prevents test suite failures in
   * environments where DOM simulation is not needed or available.
   */
  if(!JSDOM){
    it('skips when jsdom missing', () => { assert.ok(true); }); // placeholder test when JSDOM unavailable
    return;
  }
  
  /*
   * CSS INJECTION AND ENVIRONMENT DETECTION VALIDATION
   * 
   * TEST STRATEGY:
   * Verifies two critical browser behaviors:
   * 1. serverSide flag remains undefined (no server detection)
   * 2. CSS stylesheet is automatically injected into DOM
   * 
   * This confirms the module correctly distinguishes browser from Node.js
   * environments and provides automatic CSS loading for browser users.
   */
  it('injects stylesheet and serverSide undefined', () => {
    assert.strictEqual(mod.serverSide, undefined); // verifies serverSide not set in browser environment
    const expected = path.resolve(__dirname, '../qore.css'); // expected css path for validation
    const link = document.querySelector('link[href*="core"]') || document.querySelector('link[href*="qore"]') || document.querySelector('style'); // searches for injected CSS in multiple forms
    assert.ok(link); // confirms CSS injection occurred in simulated browser environment
  });

  it('avoids duplicate injection on subsequent loads', () => {
    const countBefore = document.head.querySelectorAll('link').length; // captures link count after first load for comparison
    delete require.cache[require.resolve('../index.js')]; // clears cache to force re-execution of module
    require('../index.js'); // triggers injectCss again to test duplicate avoidance
    const countAfter = document.head.querySelectorAll('link').length; // counts links after second load to verify no extra element
    assert.strictEqual(countBefore, countAfter); // ensures link count unchanged meaning no duplicate injection
  });
});
