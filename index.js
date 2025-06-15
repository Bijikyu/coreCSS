
/*
 * QORECSS NPM MODULE ENTRY POINT - UNIVERSAL CSS FRAMEWORK INTERFACE
 * 
 * PURPOSE AND RATIONALE:
 * This module provides a unified interface for consuming qoreCSS in various
 * JavaScript environments and build systems. It addresses the challenge of
 * distributing CSS frameworks across different usage patterns:
 * 
 * 1. NODE.JS APPLICATIONS: Providing file paths for server-side rendering
 * 2. BUNDLER INTEGRATION: Enabling import/require in Webpack, Rollup, etc.
 * 3. BROWSER ENVIRONMENTS: Auto-injection for direct script tag usage
 * 4. BUILD TOOLS: Programmatic access to stylesheet paths
 * 
 * DESIGN DECISIONS:
 * - require.resolve() provides absolute paths for reliable file resolution
 * - Environment detection enables appropriate behavior in server vs browser
 * - Helper functions abstract common usage patterns
 * - Browser auto-injection provides zero-config experience
 * 
 * This approach maximizes compatibility across JavaScript ecosystems while
 * providing an intuitive API for developers familiar with modern npm packages.
 */

/*
 * MAIN MODULE EXPORT OBJECT
 * 
 * API DESIGN RATIONALE:
 * The module exports both direct path properties and helper functions to
 * accommodate different coding styles and use cases:
 * - Direct properties for immediate access
 * - Functions for consistency with other APIs
 * - Descriptive names that clearly indicate purpose
 */
module.exports = {
  /*
   * CORE STYLESHEET PATH
   * Rationale: require.resolve() returns the absolute filesystem path to the
   * CSS file, enabling reliable file access regardless of the calling module's
   * location. This is essential for server-side rendering, build tools, and
   * any scenario where the actual file path is needed.
   */
  coreCss: require.resolve('./qore.css'), // core CSS path changed to qore.css for new file name
  
  /*
   * VARIABLES STYLESHEET PATH  
   * Rationale: Provides separate access to the CSS variables file, enabling
   * advanced use cases like:
   * - Custom variable overrides before main CSS
   * - Build-time variable processing
   * - Selective inclusion in optimized builds
   */
  variablesCss: require.resolve('./variables.css'),
  
  /*
   * CORE STYLESHEET HELPER FUNCTION
   * Rationale: Function wrapper provides consistent API with other npm packages
   * and enables future enhancements like parameter-based file variants
   * (compressed, uncompressed, themed versions, etc.)
   */
  getStylesheet: function() {
    console.log(`getStylesheet is running with`); // entry log for helper call
    const result = require.resolve('./qore.css'); // resolves stylesheet path
    console.log(`getStylesheet is returning ${result}`); // logs resolved path
    return result; // returns qore.css path for consistency
  },
  
  /*
   * VARIABLES STYLESHEET HELPER FUNCTION
   * Rationale: Parallel function to getStylesheet() for consistency.
   * Abstracts file resolution logic and provides extension point for
   * future features like variable preprocessing or theme selection.
   */
  getVariables: function() {
    console.log(`getVariables is running with`); // entry log for helper call
    const result = require.resolve('./variables.css'); // resolves variables path
    console.log(`getVariables is returning ${result}`); // logs resolved path
    return result; // returns variables.css path
  }
};

/*
 * ENVIRONMENT-SPECIFIC BEHAVIOR CONFIGURATION
 * 
 * DETECTION STRATEGY:
 * Uses typeof window to distinguish between Node.js (server) and browser
 * environments. This is more reliable than navigator checks and works
 * across different JavaScript runtime environments.
 */
if (typeof window === 'undefined') {
  /*
   * SERVER-SIDE ENVIRONMENT CONFIGURATION
   * Rationale: In Node.js environments, the module provides file paths
   * and metadata for server-side rendering, build tools, and other
   * programmatic usage. The serverSide flag enables calling code to
  * detect the environment and adapt behavior accordingly.
  */
  module.exports.serverSide = true; // signals Node.js usage so consumers can skip browser injection
} else {
  /*
   * BROWSER ENVIRONMENT AUTO-INJECTION
   * 
   * AUTOMATIC STYLESHEET LOADING:
   * When included directly in browser environments (script tag, browser bundle),
   * this code automatically injects the CSS into the document head. This provides
   * a zero-configuration experience similar to other CSS-in-JS libraries.
   * 
   * IMPLEMENTATION RATIONALE:
   * - createElement('link') creates proper stylesheet link element
   * - rel='stylesheet' and type='text/css' ensure browser recognizes CSS
   * - href resolves path via require.resolve or current script when available
   * - appendChild(link) adds to document head for immediate effect
   * 
   * This approach enables usage like: <script src="node_modules/qorecss/index.js"></script> // corrected path to lowercase for consistency
   * with automatic CSS injection, providing an alternative to manual link tags.
   */
 injectCss(); // calls helper for dynamic stylesheet injection
}

function injectCss(){ // handles runtime stylesheet loading logic
 console.log(`injectCss is running with ${document.currentScript && document.currentScript.src}`); // logs entry and script src
 try {
  let scriptEl = document.currentScript; // uses current script element when available
  if(!scriptEl){ scriptEl = document.querySelector('script[src$="index.js" i]'); } // detects loading via standard filename when currentScript missing
  if(!scriptEl){ scriptEl = document.querySelector('[data-qorecss]'); } // detects custom attribute for flexible inclusion
  const scriptSrc = scriptEl && scriptEl.src ? scriptEl.src : ''; // avoids errors when element or src missing
  const basePath = scriptSrc ? scriptSrc.slice(0, scriptSrc.lastIndexOf('/') + 1) : document.baseURI; // defaults to document.baseURI when no script found
  const cssFile = `core.5c7df4d0.min.css`; // placeholder replaced during build
  const existing = Array.from(document.head.querySelectorAll('link')) // collects current link elements for reuse check
    .find(l => l.href.includes(cssFile) || l.href.includes('qore.css')); // searches for prior injection by hashed or fallback name
  if(!existing){ // avoids duplicate injection when link already present
   const link = document.createElement('link'); // creates stylesheet link element
   link.rel = 'stylesheet'; // declares relationship to browser
   link.type = 'text/css'; // MIME type for clarity across tools
   link.href = `${basePath}${cssFile}`; // resolves href using whichever file exists
   link.onerror = () => { link.href = `${basePath}qore.css`; console.log(`injectCss fallback to ${link.href}`); }; // swaps to qore.css on load failure
   document.head.appendChild(link); // injects stylesheet into document
   console.log(`injectCss is returning ${cssFile}`); // logs resolved filename when hashed file loads
  } else {
   console.log(`injectCss is returning ${existing.href}`); // logs reuse of previously injected link
  }
 } catch(err){
  console.error('injectCss failed:', err.message); // logs any runtime failure
 }
}

