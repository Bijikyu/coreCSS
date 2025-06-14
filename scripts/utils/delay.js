/*
 * DELAY UTILITY
 *
 * PURPOSE AND RATIONALE:
 * Provides a shared, promise-based delay used by multiple scripts.
 * Centralizing this function avoids code duplication while keeping
 * optional logging for debugging visibility when needed.
 */

const {setTimeout: wait} = require('node:timers/promises'); // Promise-based timer for async delays

async function delay(ms, log){
  if(log){ console.log(`delay is running with ${ms}`); } // optional entry log for debugging
  await wait(ms); // non-blocking wait using built-in timer
  if(log){ console.log(`delay is returning undefined`); } // optional exit log when logging enabled
} // replicates previous delay behavior with shared utility

module.exports = delay; // exports delay function for reuse across scripts
