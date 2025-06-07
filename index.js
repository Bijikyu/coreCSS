
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
  coreCss: require.resolve('./core.css'),
  
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
    return require.resolve('./core.css');
  },
  
  /*
   * VARIABLES STYLESHEET HELPER FUNCTION
   * Rationale: Parallel function to getStylesheet() for consistency.
   * Abstracts file resolution logic and provides extension point for
   * future features like variable preprocessing or theme selection.
   */
  getVariables: function() {
    return require.resolve('./variables.css');
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
  module.exports.serverSide = true;
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
   * - href uses require.resolve for consistent path resolution
   * - appendChild(link) adds to document head for immediate effect
   * 
   * This approach enables usage like: <script src="node_modules/qoreCSS/index.js"></script>
   * with automatic CSS injection, providing an alternative to manual link tags.
   */
 const link = document.createElement('link'); // Creates <link> element for stylesheet injection
 link.rel = 'stylesheet'; // Specifies relationship type to browser
 link.type = 'text/css'; // Explicit MIME type for clarity across tools
 link.href = require.resolve('./core.css'); // Resolves absolute path for reliability in different bundlers
 document.head.appendChild(link); // Inserts stylesheet into DOM for immediate effect
}
