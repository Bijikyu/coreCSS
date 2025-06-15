// ERROR LOGGER UTILITY
//
// PURPOSE AND RATIONALE:
// Provides a consistent error logging function across all scripts.
// It attempts to use the qerrors module for structured error logging
// but falls back to console.error when qerrors is unavailable.

let logger;
try {
  logger = require('qerrors'); // Use qerrors when available for structured error logging
} catch (err) {
  function fallbackLogger(error, msg, ctx) { // provides console.error fallback when qerrors missing
    console.log(`fallbackLogger is running with ${error},${msg},${ctx}`); // entry log includes context info
    console.error(error, msg, ctx); // basic error output with context
    console.log(`fallbackLogger is returning undefined with context ${ctx}`); // exit log mentions context
  }
  logger = fallbackLogger; // assign fallback implementation
}

module.exports = logger; // exports chosen logger function for use across scripts
