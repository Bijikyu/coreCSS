/*
 * DELAY UTILITY
 *
 * PURPOSE AND RATIONALE:
 * Provides a reusable promise based delay used across multiple scripts.
 * Centralizing this avoids duplication while preserving consistent logging behavior.
 */

const {setTimeout: wait} = require('node:timers/promises'); // uses built in promise timer for async waits

async function delay(ms, log){
  if(log){ console.log(`delay is running with ${ms}`); } // entry log when enabled
  await wait(ms); // asynchronous wait without blocking event loop
  if(log){ console.log(`delay is returning undefined`); } // exit log when enabled
} // shared delay utility with optional logging

module.exports = delay; // exposes delay function for reuse across scripts
