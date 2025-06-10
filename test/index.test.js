/*
 * INDEX MODULE TESTING - NPM PACKAGE INTERFACE VALIDATION
 * 
 * PURPOSE AND RATIONALE:
 * This test suite validates the main entry point module (index.js) that provides
 * the npm package interface for qoreCSS. The module must reliably export CSS
 * file paths and helper functions for various JavaScript environments including
 * Node.js servers, bundlers, and browser environments.
 * 
 * TESTING STRATEGY:
 * - Path resolution validation ensures CSS files are accessible
 * - Function interface testing confirms API consistency
 * - Environment detection validation ensures proper Node.js behavior
 * - Module cache clearing prevents test interference
 * 
 * This testing approach ensures the npm package works correctly across different
 * consumption patterns while maintaining reliable file path resolution.
 */

require("./helper"); // loads module stubbing for consistent test environment
const assert = require('node:assert'); // Node.js built-in assertion library for test validation
const path = require('node:path'); // path utilities for reliable cross-platform file handling
const {describe, it, beforeEach, afterEach} = require('node:test'); // Node.js native test framework components

let mod; // module reference, assigned after cache clearing to ensure fresh state

/*
 * TEST SETUP CONFIGURATION
 * 
 * MODULE ISOLATION STRATEGY:
 * Each test gets a fresh module instance by clearing the require cache and
 * ensuring the working directory is correct for path resolution. This prevents
 * test state from affecting subsequent tests and ensures consistent behavior.
 */
beforeEach(() => {
  process.chdir(path.resolve(__dirname, '..')); // ensures paths resolve correctly from project root
  delete require.cache[require.resolve('../index.js')]; // resets module cache for fresh imports
  mod = require('../index.js'); // imports module with clean state
});

/*
 * NPM PACKAGE INTERFACE VALIDATION
 * 
 * TESTING SCOPE:
 * Validates all public API exports including direct properties and helper
 * functions. These tests ensure the module provides reliable access to CSS
 * files regardless of how consumers import or require the package.
 */
describe('index module', {concurrency:false}, () => {
  /*
   * CORE CSS FILE PATH VALIDATION
   * 
   * TEST RATIONALE:
   * The coreCss property must always point to an existing file path that
   * consumers can reliably access. This test ensures require.resolve()
   * correctly resolves the CSS file path and the file actually exists.
   */
  it('exports coreCss path that exists', () => {
    assert.ok(require('fs').existsSync(mod.coreCss)); // verifies CSS file exists at resolved path
  });

  /*
   * VARIABLES CSS FILE PATH VALIDATION
   * 
   * TEST RATIONALE:
   * The variablesCss property provides access to CSS custom properties
   * for theming and customization. This test ensures the path resolution
   * works correctly and the variables file is accessible to consumers.
   */
  it('exports variablesCss path that exists', () => {
    assert.ok(require('fs').existsSync(mod.variablesCss)); // verifies variables file exists at resolved path
  });

  /*
   * STYLESHEET HELPER FUNCTION VALIDATION
   * 
   * TEST RATIONALE:
   * The getStylesheet() function provides an alternative API for accessing
   * the core CSS path. This test ensures API consistency between the direct
   * property and helper function approaches for maximum consumer flexibility.
   */
  it('getStylesheet returns coreCss path', () => {
    assert.strictEqual(mod.getStylesheet(), mod.coreCss); // confirms function returns same path as property
  });

  /*
   * VARIABLES HELPER FUNCTION VALIDATION
   * 
   * TEST RATIONALE:
   * The getVariables() function provides an alternative API for accessing
   * the variables CSS path. This test ensures parallel API consistency
   * with the getStylesheet() function pattern.
   */
  it('getVariables returns variablesCss path', () => {
    assert.strictEqual(mod.getVariables(), mod.variablesCss); // confirms function returns same path as property
  });

  /*
   * SERVER-SIDE ENVIRONMENT DETECTION VALIDATION
   * 
   * TEST RATIONALE:
   * The serverSide flag enables consumers to detect when running in Node.js
   * versus browser environments. This test ensures the flag is correctly
   * set in Node.js test environments, confirming environment detection works.
   */
  it('serverSide flag is true in Node environment', () => {
    assert.strictEqual(mod.serverSide, true); // verifies Node.js environment detection is working
  });
});
