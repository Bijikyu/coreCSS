/*
 * DELAY UTILITY FUNCTION
 * 
 * PURPOSE AND RATIONALE:
 * This utility provides a centralized delay/wait function used across multiple
 * scripts for timing control, retry mechanisms, and performance testing.
 * Centralizing this eliminates code duplication while providing consistent
 * behavior and logging across all modules.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Promise-based for clean async/await integration
 * - Optional logging for debugging and monitoring
 * - Precise timing using setTimeout for accurate delays
 * - Consistent API across all consuming modules
 */

/**
 * ASYNCHRONOUS DELAY FUNCTION
 * 
 * @param {number} ms - Delay duration in milliseconds
 * @param {boolean} enableLogging - Whether to log delay start/completion
 * @returns {Promise<void>} Promise that resolves after specified delay
 * 
 * DELAY IMPLEMENTATION RATIONALE:
 * - Uses setTimeout wrapped in Promise for clean async operation
 * - Optional logging enables debugging without performance overhead
 * - Accurate timing for performance testing and retry mechanisms
 * - Non-blocking operation preserves event loop efficiency
 */
function wait(ms, enableLogging = false) {
  if (enableLogging) {
    console.log(`wait is running with ${ms}`); // Log delay initiation for debugging
  }
  
  return new Promise(resolve => {
    setTimeout(() => {
      if (enableLogging) {
        console.log(`wait is returning undefined`); // Log delay completion
      }
      resolve(); // Resolve promise after delay
    }, ms);
  });
}

module.exports = { wait };