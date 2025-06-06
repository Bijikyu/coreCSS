
/*
 * HTTP REQUEST UTILITY WITH EXPONENTIAL BACKOFF RETRY LOGIC
 * 
 * PURPOSE AND RATIONALE:
 * This utility addresses the inherent unreliability of network requests by
 * implementing a robust retry mechanism with exponential backoff. It solves
 * several common network reliability issues:
 * 
 * 1. TRANSIENT FAILURES: Temporary network glitches, DNS timeouts, connection drops
 * 2. RATE LIMITING: CDN or server temporary throttling responses
 * 3. SERVER OVERLOAD: Temporary unavailability due to high load
 * 4. NETWORK CONGESTION: Packet loss requiring retransmission at application level
 * 
 * DESIGN DECISIONS:
 * - Exponential backoff prevents overwhelming struggling servers
 * - Configurable timeout balances responsiveness with reliability
 * - Detailed error logging enables debugging of network issues
 * - Axios chosen for its reliability and comprehensive HTTP feature support
 * 
 * This approach significantly improves success rates for network operations
 * while being respectful to target servers during outages or high load periods.
 */

const axios = require('axios'); // Robust HTTP client library with comprehensive feature set
const qerrors = require('qerrors'); // Centralized error logging with contextual information preservation

/*
 * DELAY UTILITY FUNCTION
 * 
 * Rationale: Implements non-blocking delays for exponential backoff strategy.
 * Promise-based approach integrates cleanly with async/await patterns.
 * Logging provides visibility into retry timing for debugging purposes.
 */
function wait(ms){ 
 console.log(`wait is running with ${ms}`); // Logs delay duration for retry timing analysis
 return new Promise(res=>setTimeout(()=>{console.log(`wait is returning undefined`);res();},ms)); // Promise-wrapped setTimeout with completion logging
}

/*
 * HTTP REQUEST WITH EXPONENTIAL BACKOFF RETRY LOGIC
 * 
 * RETRY STRATEGY:
 * - 1st attempt: Immediate
 * - 2nd attempt: 100ms delay  
 * - 3rd attempt: 200ms delay
 * - Pattern: delay = 2^(attempt-1) * 100ms
 * 
 * This exponential backoff prevents overwhelming struggling servers while
 * providing quick recovery for transient issues. The delay progression
 * balances quick retry for temporary glitches with respectful backing off
 * for sustained issues.
 * 
 * TIMEOUT STRATEGY:
 * Default 10-second timeout balances:
 * - User experience (not too slow)
 * - Network reality (allows for slow connections)
 * - Resource management (prevents hanging connections)
 */
async function fetchRetry(url,opts={},attempts=3){ 
  console.log(`fetchRetry is running with ${url},${attempts}`); // Logs request initiation with parameters
 
 /*
  * TIMEOUT CONFIGURATION
  * Rationale: 10-second default timeout provides reasonable balance between
  * waiting for slow responses and preventing resource exhaustion from hanging
  * connections. Allows override for specific use cases (large files, slow networks).
  */
 if(!('timeout' in opts)){ opts.timeout = 10000; } 
 
  /*
   * RETRY LOOP WITH EXPONENTIAL BACKOFF
   * Rationale: Loop structure enables clean retry logic with progressive delays.
   * Each iteration represents one complete request attempt with error handling.
   */
  for(let i=1;i<=attempts;i++){ 
   try{
    /*
     * HTTP REQUEST EXECUTION
     * Rationale: axios.get provides reliable HTTP client with good error handling,
     * timeout support, and comprehensive response object. Options object allows
     * caller to specify responseType, headers, and other request configuration.
     */
    const res=await axios.get(url,opts); 
   console.log(`fetchRetry is returning ${res.status}`); // Logs successful response status
   return res; // Returns complete axios response object for caller processing
  }catch(err){
   /*
    * ERROR LOGGING WITH CONTEXT
    * Rationale: Each failed attempt is logged with context to enable debugging
    * of network issues, server problems, or configuration errors. Attempt number
    * helps identify whether issues are consistent or intermittent.
    */
   qerrors(err,`fetch attempt ${i}`,{url,attempt:i}); 
   
   /*
    * FINAL ATTEMPT HANDLING
    * Rationale: After exhausting all retry attempts, the error is re-thrown
    * to allow calling code to handle the failure appropriately. This prevents
    * infinite retry loops while preserving error information.
    */
   if(i===attempts){ 
    throw err; // Re-throws final error for caller to handle
   }
   
   /*
    * EXPONENTIAL BACKOFF DELAY CALCULATION
    * Rationale: 2^(attempt-1) * 100ms creates exponential backoff:
    * - Attempt 1 failure: 100ms delay before attempt 2
    * - Attempt 2 failure: 200ms delay before attempt 3
    * This pattern respects struggling servers while enabling quick recovery.
    */
   const delay=2**(i-1)*100; 
   await wait(delay); // Implements delay before next retry attempt
  }
 }
}

/*
 * MODULE EXPORT
 * Rationale: Exports the main retry function for use by other modules.
 * Clean interface hides implementation details while providing robust
 * HTTP request capability throughout the application.
 */
module.exports=fetchRetry;
