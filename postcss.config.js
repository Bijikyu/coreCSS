
/*
 * POSTCSS CONFIGURATION - CSS PROCESSING PIPELINE SETUP
 * 
 * PURPOSE AND RATIONALE:
 * This configuration file defines the CSS processing pipeline that transforms
 * the source CSS into production-ready, cross-browser compatible stylesheets.
 * PostCSS chosen over alternatives (Sass, Less) for several reasons:
 * 
 * 1. PERFORMANCE: Faster processing than full preprocessors
 * 2. MODULARITY: Plugin-based architecture enables precise control
 * 3. MODERN STANDARDS: Focuses on CSS spec compliance rather than proprietary syntax
 * 4. ECOSYSTEM: Extensive plugin ecosystem for any CSS processing need
 * 
 * PLUGIN SELECTION RATIONALE:
 * - autoprefixer: Ensures cross-browser compatibility without manual vendor prefixes
 * - cssnano: Optimizes CSS for production with advanced minification techniques
 * 
 * This configuration balances comprehensive browser support with optimal
 * file size and processing speed.
 */

module.exports = {
  /*
   * PLUGIN PIPELINE CONFIGURATION
   * 
   * PROCESSING ORDER RATIONALE:
   * Plugins execute in array order, which is critical for proper CSS processing:
   * 1. autoprefixer runs first to add vendor prefixes
   * 2. cssnano runs last to optimize the final CSS with prefixes included
   * 
   * This order prevents cssnano from removing prefixes that autoprefixer added,
   * ensuring maximum browser compatibility in the final output.
   */
  plugins: [
    /*
     * AUTOPREFIXER CONFIGURATION
     * 
     * PURPOSE: Automatically adds vendor prefixes for CSS properties that require
     * them for cross-browser compatibility. Uses Can I Use database to determine
     * which prefixes are needed based on browser support targets.
     * 
     * CONFIGURATION STRATEGY:
     * No explicit options means autoprefixer uses browserslist configuration
     * from package.json, providing centralized browser target management.
     * This ensures consistency between autoprefixer and other build tools.
     * 
     * BROWSER SUPPORT:
     * Based on package.json browserslist: ">0.5%, last 2 versions, not dead"
     * This covers ~95% of global browser usage while excluding obsolete browsers.
     */
    require('autoprefixer'),
    
    /*
     * CSSNANO OPTIMIZATION CONFIGURATION
     * 
     * PURPOSE: Advanced CSS minification and optimization that goes beyond
     * simple whitespace removal. Includes optimizations like:
     * - Property value optimization (colors, units, etc.)
     * - Duplicate rule removal
     * - Unused at-rule removal
     * - Selector optimization
     * 
     * PRESET SELECTION:
     * 'default' preset provides comprehensive optimizations while maintaining
     * CSS functionality. More aggressive presets available but may break
     * certain CSS patterns or browser compatibility.
     * 
     * SAFETY CONSIDERATIONS:
     * Default preset avoids optimizations that could change CSS behavior,
     * ensuring the minified CSS produces identical visual results to source.
     */
    require('cssnano')({
      preset: 'default', // Safe optimization preset that maintains CSS behavior
    }),
  ],
};
