const {setTimeout: wait} = require('node:timers/promises'); // promise-based timer for async waits

function delay(ms, log){
 console.log(`delay is running with ${ms},${log}`); // entry log with parameters
 return wait(ms).then(()=>{
  console.log(`delay is returning undefined`); // exit log noting completion
 });
} // provides reusable delay with optional logging for retry strategies

module.exports = delay; // exports function for use across scripts
