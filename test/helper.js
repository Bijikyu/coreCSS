/*
 * TEST HELPER MODULE - CENTRALIZED STUBBING AND MOCK UTILITIES
 * 
 * PURPOSE AND RATIONALE:
 * This helper module provides centralized stubbing functionality for the test suite.
 * It intercepts module loading to replace external dependencies with controlled stubs,
 * enabling isolated, fast, and reliable testing without external service dependencies.
 * 
 * STUBBING STRATEGY:
 * - Module.prototype.require override: Intercepts all require() calls
 * - Selective stubbing: Only replaces specific modules (axios, qerrors)
 * - Fallback behavior: Preserves normal require() for unstubbed modules
 * - Path resolution: Ensures correct file paths for CSS assets
 */

const Module = require('module'); // Node.js module system for require interception
const path = require('node:path'); // Path utilities for cross-platform file resolution
const orig = Module.prototype.require; // Preserves original require function for fallback

/*
 * MOCK IMPLEMENTATIONS
 * 
 * AXIOS STUB RATIONALE:
 * Provides minimal HTTP client interface that returns successful responses
 * without making actual network requests. The create() method returns 'this'
 * to support axios.create() patterns used in the application.
 * 
 * QERRORS STUB RATIONALE:
 * Silent error logging stub that prevents console noise during testing
 * while maintaining the same function signature as the real qerrors module.
 */
const axiosStub = {get: async ()=>({status:200}),create(){return this;}}; // HTTP client stub returning successful responses
function axiosRetryStub(axiosInst,{retries=3,retryDelay=()=>0}={}){ // minimal retry interceptor for tests
  const originalGet=axiosInst.get; // preserves base get implementation
  axiosInst.get=async function(url,opts={}){ // wraps get with retry logic
    const perReqRetries=opts['axios-retry']?.retries ?? retries; // request-specific retries
    for(let attempt=0;;attempt++){ // retry loop executed until success or max
      try{return await originalGet(url,opts); }catch(err){ if(attempt>=perReqRetries){ throw err; } await new Promise(r=>setTimeout(r,retryDelay(attempt+1))); }
    }
  }; // attaches automatic retry wrapper to axios instance
} // stub replicates axios-retry behavior for tests
axiosRetryStub.exponentialDelay=(retry)=>2**(retry-1)*100; // mirrors exponential delay calculation
const qerrorsStub = () => {}; // Silent error logging stub for test environment

/*
 * MODULE REQUIRE INTERCEPTION
 * 
 * INTERCEPTION STRATEGY:
 * Overrides Module.prototype.require to intercept specific module loads
 * while preserving normal Node.js module resolution for everything else.
 * This approach enables surgical stubbing without affecting the entire
 * module system or requiring complex test setup.
 */
Module.prototype.require = function(id){
  if(id==='axios') return axiosStub; // Replaces axios with HTTP client stub
  if(id==='qerrors') return qerrorsStub; // Replaces qerrors with silent logging stub
  if(id==='axios-retry') return axiosRetryStub; // Provides axios-retry behavior for retry testing

  return orig.call(this,id); // Preserves normal require behavior for other modules
};

/*
 * FILE PATH RESOLUTION OVERRIDE
 * 
 * RESOLUTION STRATEGY RATIONALE:
 * Overrides Node.js module resolution for CSS files to ensure consistent
 * path handling across different test execution contexts. Tests may run
 * from different working directories, so absolute path resolution prevents
 * file-not-found errors during CSS file require operations.
 * 
 * This is essential for testing the main index.js module which uses
 * require.resolve() to get CSS file paths for npm package consumers.
 */
const origResolve = Module._resolveFilename; // Preserves original filename resolution for restoration
Module._resolveFilename = function(request, parent, isMain, options){
  if(request === './qore.css') return path.resolve(__dirname,'../qore.css'); // Resolves qore.css to absolute path from project root
  if(request === './variables.css') return path.resolve(__dirname,'../variables.css'); // Resolves variables.css to absolute path from project root
  return origResolve.call(this, request, parent, isMain, options); // Preserves normal resolution for other files
};

if(!global.__restoreResolveFilenameHooked){ // ensures cleanup hook added only once
  process.once('exit', ()=>{ Module._resolveFilename = origResolve; }); // restores original resolver after all tests run
  global.__restoreResolveFilenameHooked = true; // flag prevents duplicate hooks across test files
}
