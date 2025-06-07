
/*
 * PERFORMANCE TESTING SCRIPT - CDN RESPONSE TIME MEASUREMENT
 * 
 * PURPOSE AND RATIONALE:
 * This script provides automated performance monitoring for qoreCSS delivery
 * across multiple CDN endpoints. It addresses several critical needs:
 * 
 * 1. CDN PERFORMANCE COMPARISON: Measures actual download times across different CDNs
 * 2. RELIABILITY MONITORING: Detects CDN outages or performance degradation
 * 3. HISTORICAL TRACKING: Builds performance history for trend analysis
 * 4. LOAD TESTING: Simulates concurrent user requests to test CDN capacity
 * 
 * DESIGN DECISIONS:
 * - Queue-based concurrency prevents overwhelming CDN endpoints
 * - Exponential backoff with retries handles transient network issues
 * - Environment detection enables testing in offline development environments
 * - JSON output format enables integration with monitoring dashboards
 * 
 * The testing methodology simulates real-world usage patterns while respecting
 * CDN rate limits and providing actionable performance data.
 */

const fetchRetry = require('./request-retry'); // HTTP client with retry logic for handling network failures
const {performance} = require('perf_hooks'); // High-resolution timing API for accurate measurements
const qerrors = require('qerrors'); // Centralized error logging with contextual information
const fs = require('fs'); // File system operations for reading/writing test results
const pLimit = require('p-limit'); // Concurrency limiting to prevent overwhelming target servers
const CDN_BASE_URL = process.env.CDN_BASE_URL || `https://cdn.jsdelivr.net`; // Environment-configurable CDN endpoint
const MAX_CONCURRENCY = 50; // Upper safety limit to prevent excessive server load
const QUEUE_LIMIT = 5; // Conservative concurrent request limit for respectful testing

/*
 * NETWORK DELAY SIMULATION
 * 
 * Rationale: In offline development environments (CODEX), we can't make real
 * network requests. This function simulates realistic network delays to enable
 * testing the measurement logic without requiring internet connectivity.
 * 100ms delay approximates fast CDN response times.
 */
function wait(ms){ 
 console.log(`wait is running with ${ms}`); // Logs wait duration for debugging timing issues
 return new Promise(res => setTimeout(()=>{console.log(`wait is returning undefined`);res();}, ms)); // Promise-based delay with completion logging
}

/*
 * SINGLE REQUEST TIMING MEASUREMENT
 * 
 * MEASUREMENT METHODOLOGY:
 * Uses performance.now() for high-resolution timing that's not affected by
 * system clock adjustments. Measures total time including:
 * - DNS resolution
 * - TCP connection establishment
 * - TLS handshake (for HTTPS)
 * - HTTP request/response
 * - Data transfer
 * 
 * This provides end-to-end timing that reflects user experience.
 */
async function getTime(url){ 
 console.log(`getTime is running with ${url}`); // Logs request URL for debugging and monitoring
 const start = performance.now(); // Records high-resolution start timestamp
 try {
  /*
   * ENVIRONMENT-SPECIFIC REQUEST HANDLING
   * Rationale: Development environments may not have internet access.
   * CODEX environment flag enables testing measurement logic offline.
   */
  if(process.env.CODEX === `True`){ 
   await wait(100); // Simulates network delay in offline environment
  } else {
   /*
    * ACTUAL NETWORK REQUEST
    * arrayBuffer responseType ensures we download the complete file
    * rather than just headers, providing realistic timing measurements.
    */
   await fetchRetry(url,{responseType:`arraybuffer`}); 
  }
  const time = performance.now() - start; // Calculates elapsed time with high precision
  console.log(`getTime is returning ${time}`); // Logs measurement result for monitoring
  return time; // Returns elapsed time in milliseconds
 } catch(err){
  qerrors(err, `getTime failed`, {url}); // Logs failure with URL context for debugging
  throw err; // Re-throws to allow caller to handle or aggregate errors
 }
}

/*
 * CONCURRENT REQUEST MEASUREMENT WITH QUEUE MANAGEMENT
 * 
 * CONCURRENCY STRATEGY:
 * Uses p-limit to control concurrent requests, preventing:
 * - CDN rate limiting
 * - Network congestion
 * - Local resource exhaustion
 * 
 * This approach simulates realistic user load while being respectful
 * to CDN infrastructure and providing reliable measurements.
 */
async function measureUrl(url, count){ 
 console.log(`measureUrl is running with ${url},${count}`); // Logs test parameters for monitoring
 try {
  /*
   * QUEUE SETUP
   * Rationale: p-limit creates a queue that ensures only QUEUE_LIMIT
   * requests run simultaneously. This prevents overwhelming the target
   * server while still testing concurrent performance characteristics.
   */
  const limit = pLimit(QUEUE_LIMIT); 
  
  /*
   * TASK GENERATION
   * Rationale: Wrapping getTime in the limiter creates queued tasks
   * that will execute with controlled concurrency. Array.from provides
   * clean generation of the specified number of tasks.
   */
  const tasks = Array.from({length: count}, () => limit(() => getTime(url))); 
  
  /*
   * PARALLEL EXECUTION WITH CONTROLLED CONCURRENCY
   * Promise.all waits for all requests to complete while p-limit
   * ensures controlled concurrency. This provides comprehensive
   * timing data while respecting server resources.
   */
  const times = await Promise.all(tasks); 
  
  /*
   * STATISTICAL ANALYSIS
   * Rationale: Average provides a single representative value for
   * comparison across CDNs and over time. Could be extended with
   * median, percentiles, or standard deviation for more detailed analysis.
   */
  const avg = times.reduce((a,b)=>a+b,0)/count; 
  console.log(`measureUrl is returning ${avg}`); // Logs average for monitoring
  return avg; // Returns average response time for comparison
 } catch(err){
  qerrors(err, `measureUrl failed`, {url,count}); // Logs error with full test parameters
  throw err; // Re-throws to allow caller to handle failures appropriately
 }
}

/*
 * MAIN EXECUTION FUNCTION - TEST ORCHESTRATION
 * 
 * WORKFLOW:
 * 1. Read current build hash to test correct CSS version
 * 2. Construct test URLs for all CDN endpoints
 * 3. Parse command line arguments for test configuration
 * 4. Execute tests against all endpoints
 * 5. Display results and optionally save to JSON for historical tracking
 * 
 * This provides comprehensive CDN performance evaluation with flexible
 * configuration and optional data persistence.
 */
async function run(){ 
 console.log(`run is running with ${process.argv.length}`); // Logs execution start for monitoring
 try {
  /*
   * BUILD HASH INTEGRATION
   * Rationale: Tests must use the current CSS version to provide meaningful
   * results. Reading from build.hash ensures we're testing the same files
   * that users will actually receive. Fallback to core.min.css handles
   * cases where build hasn't run yet.
   */
  let hash = ``; 
  if(fs.existsSync(`build.hash`)){ hash = fs.readFileSync(`build.hash`,`utf8`).trim(); } 
  const fileName = hash ? `core.${hash}.min.css` : `core.min.css`; 
  
  /*
   * CDN ENDPOINT CONFIGURATION
   * Rationale: Testing multiple CDNs provides:
   * - Performance comparison data
   * - Failover validation
   * - Geographic performance insights
   * jsDelivr and GitHub Pages chosen as primary/secondary CDN strategy.
   */
  const urls = [
   `${CDN_BASE_URL}/gh/Bijikyu/qoreCSS/${fileName}`, // Primary CDN (configurable)
   `https://bijikyu.github.io/qoreCSS/${fileName}` // Secondary CDN (GitHub Pages)
  ];
  
  /*
   * COMMAND LINE ARGUMENT PARSING
   * Rationale: Flexible CLI interface enables:
   * - Integration with CI/CD systems
   * - Manual testing with different parameters
   * - Automated monitoring with result persistence
   */
  const args = process.argv.slice(2); 
  const jsonFlag = args.includes(`--json`); // Enables JSON output for automated processing
  if(jsonFlag){ args.splice(args.indexOf(`--json`),1); } // Removes flag from numeric arguments
  
  /*
   * CONCURRENCY CONFIGURATION WITH SAFETY LIMITS
   * Rationale: Configurable concurrency enables testing different load patterns
   * while safety limits prevent accidental DDoS of CDN endpoints.
   * Default of 5 provides meaningful load testing without being aggressive.
   */
  let concurrency = parseInt(args[0],10); 
  if(Number.isNaN(concurrency)){ concurrency = 5; } // Sensible default for most testing scenarios
  concurrency = Math.max(1, concurrency); // Ensures at least one request (prevents divide by zero)
  if(concurrency > MAX_CONCURRENCY){ console.log(`run concurrency exceeds ${MAX_CONCURRENCY}`); concurrency = MAX_CONCURRENCY; } // Safety cap with warning
  console.log(`run concurrency set to ${concurrency}`); // Logs final concurrency setting
  
  /*
   * TEST EXECUTION ACROSS ALL ENDPOINTS
   * Rationale: Sequential testing of each endpoint prevents interference
   * between tests while still providing comprehensive performance data.
   * Results object enables structured output for automated processing.
   */
  const results = {}; 
  for(const url of urls){ 
   const avg = await measureUrl(url, concurrency); // Executes performance test
   console.log(`Average for ${url}: ${avg.toFixed(2)}ms`); // Displays human-readable results
   if(jsonFlag){ results[url] = avg; } // Stores results for JSON output
  }
  
  /*
   * HISTORICAL DATA PERSISTENCE
   * Rationale: JSON output enables:
   * - Performance trending over time
   * - Integration with monitoring dashboards
   * - Automated alerting on performance degradation
   * Timestamped entries allow correlation with deployments and incidents.
   */
  if(jsonFlag){ 
   const file = `performance-results.json`; 
   const history = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : []; // Loads existing history or creates new array
   const entry = {timestamp: new Date().toISOString(), results}; // Creates timestamped entry
   history.push(entry); // Appends to historical data
   fs.writeFileSync(file, JSON.stringify(history, null, 2)); // Saves updated history with readable formatting
  }
  console.log(`run has run resulting in a final value of 0`); // Logs successful completion
 } catch(err){
  qerrors(err, `run failed`, {args:process.argv.slice(2)}); // Logs failure with command line context
 }
}

/*
 * DIRECT EXECUTION HANDLER
 * Rationale: Enables command line usage for manual testing, CI/CD integration,
 * and automated monitoring while keeping functions available for import.
 */
if(require.main === module){ 
 run(); // Executes main function when script is run directly
}

module.exports = {getTime, measureUrl}; // Exports individual functions for unit testing and reuse
