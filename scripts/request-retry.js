
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
const http = require('node:http'); // Node HTTP used for keep-alive agent
const https = require('node:https'); // Node HTTPS used for keep-alive agent
const axiosRetry = require('axios-retry'); // Axios plugin providing automated retry support
const qerrors = require('./utils/logger'); // Centralized error logging with contextual information preservation
const {parseEnvInt} = require('./utils/env-config'); // Centralized environment configuration utilities
const socketLimit = parseEnvInt('SOCKET_LIMIT', 50, 1, 1000); // validates range 1-1000 with default 50
const axiosInstance = axios.create({httpAgent:new http.Agent({keepAlive:true,maxSockets:socketLimit}),httpsAgent:new https.Agent({keepAlive:true,maxSockets:socketLimit})}); // axios instance using variable connection limit

axiosRetry(axiosInstance,{retryDelay:axiosRetry.exponentialDelay}); // configures plugin with exponential backoff
// delay module removed since axiosRetry handles exponential backoff internally // change rationale comment


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
  console.log(`fetchRetry is running with ${url},${attempts}`); // logs entry with parameters

  if(typeof attempts!=='number'||Number.isNaN(attempts)){ console.log(`fetchRetry is returning attempts must be numeric`); throw new Error('attempts must be numeric'); } // validates numeric attempt parameter

  if(!Number.isInteger(attempts)){ console.log(`fetchRetry is returning attempts must be an integer`); throw new Error('attempts must be an integer'); } // ensures deterministic retry count

  if(attempts < 1){ console.log(`fetchRetry is returning attempts must be >0`); throw new Error('attempts must be >0'); } // validates positive attempt count
 
 /*
  * TIMEOUT CONFIGURATION
  * Rationale: 10-second default timeout provides reasonable balance between
  * waiting for slow responses and preventing resource exhaustion from hanging
  * connections. Allows override for specific use cases (large files, slow networks).
  */
 if(!('timeout' in opts)){ opts.timeout = 10000; } 
 
 try{ // executes request through axios-retry configured instance
  const res = await axiosInstance.get(url,{...opts,'axios-retry':{retries:attempts-1}}); // per-request retry count
  console.log(`fetchRetry is returning ${res.status}`); // Logs successful response status
  return res; // Returns complete axios response object for caller processing
 }catch(err){
  if(err.request){ err.request.destroy && err.request.destroy(); } // cleans up failed request
  qerrors(err,`fetch failed`,{url,attempts}); // logs failure with context
  throw err; // re-throws error after retries exhausted
 }
}

/*
 * MODULE EXPORT
 * Rationale: Exports the main retry function for use by other modules.
 * Clean interface hides implementation details while providing robust
 * HTTP request capability throughout the application.
 */
module.exports=fetchRetry;
