
/*
 * CDN CACHE PURGE UTILITY - CACHE INVALIDATION FOR IMMEDIATE UPDATES
 * 
 * PURPOSE AND RATIONALE:
 * This script addresses the challenge of CDN cache invalidation when deploying
 * new versions of CSS files. While content-based hashing generally handles
 * cache busting automatically, there are scenarios where explicit cache purging
 * is necessary:
 * 
 * 1. EMERGENCY FIXES: Critical CSS bugs that need immediate propagation
 * 2. CACHE CONSISTENCY: Ensuring all CDN edge nodes have the latest version
 * 3. DEPLOYMENT VERIFICATION: Confirming new files are properly distributed
 * 4. ROLLBACK SCENARIOS: Clearing caches when reverting to previous versions
 * 
 * DESIGN DECISIONS:
 * - Uses jsDelivr's official purge API for reliable cache invalidation
 * - Includes offline mode support for development/testing environments
 * - Integrates with build system to purge correct file versions
 * - Provides error handling and logging for debugging purge failures
 * 
 * This approach ensures users receive updated CSS immediately rather than
 * waiting for natural cache expiration, improving deployment reliability.
 */

const qerrors = require('./utils/logger'); // Centralized error logging with contextual information
const fs = require('fs').promises; // Node promise-based filesystem for async use
const fetchRetry = require('./request-retry'); // Retry wrapper for HTTP requests
const {parseEnvBool} = require('./utils/env-config'); // standardized boolean env parsing for CODEX detection

/*
 * CDN CACHE PURGE FUNCTION
 * 
 * PURGE STRATEGY:
 * Uses jsDelivr's official purge endpoint which:
 * - Invalidates cache across all global edge nodes
 * - Provides immediate cache clearing (not eventual consistency)
 * - Returns status codes for verification of purge success
 * - Handles both individual files and wildcard patterns
 * 
 * The purge URL follows jsDelivr's API specification:
 * https://purge.jsdelivr.net/gh/{user}/{repo}/{file}
 */
async function purgeCdn(file){ 
 console.log(`purgeCdn is running with ${file}`); // Logs purge initiation for monitoring
 try {
  /*
   * PURGE URL CONSTRUCTION
   * Rationale: Follows jsDelivr's official API pattern for GitHub-hosted files.
   * The URL structure ensures purge requests target the correct repository
   * and file path within the CDN's cache system.
   */
  const url = `https://purge.jsdelivr.net/gh/Bijikyu/qoreCSS/${file}`; 
  
  /*
   * ENVIRONMENT-SPECIFIC HANDLING
   * Rationale: Development environments (CODEX) may not have internet access
   * or may want to avoid making actual purge requests during testing.
   * Mock response enables testing of purge logic without affecting production CDN.
   */
  if(parseEnvBool('CODEX')){ // determines offline mode using shared parser
   console.log(`purgeCdn is returning 200`); // Logs mock success response
   return 200; // Returns HTTP 200 status code indicating successful purge
  }
  
  /*
   * ACTUAL PURGE REQUEST
   * Rationale: Uses fetchRetry utility to handle network issues during purge.
   * CDN purge endpoints can be temporarily unavailable, so retry logic
   * improves reliability of cache invalidation operations.
   */
   const res = await fetchRetry(url); // Performs purge request with retry logic
  console.log(`purgeCdn is returning ${res.status}`); // Logs actual HTTP response status
  return res.status; // Returns status code for caller verification
 } catch(err){
  qerrors(err, `purgeCdn failed`, {file}); // Logs error with file context for debugging
  throw err; // Re-throws error to allow caller to handle purge failures
}
}

/*
 * MAIN EXECUTION FUNCTION - INTEGRATION WITH BUILD SYSTEM
 * 
 * WORKFLOW:
 * 1. Read current build hash from persistent storage
 * 2. Construct filename using hash (matches build output)
 * 3. Execute CDN purge for the specific file
 * 4. Return status code for verification
 * 
 * This ensures purge operations target the exact file that was just built,
 * maintaining consistency between build and deployment processes.
 */
async function run(){
 console.log(`run is running with ${process.argv.length}`); // Logs execution start for monitoring
 try {
  await fs.access(`build.hash`); // ensures build hash file exists before reading
  /*
   * BUILD HASH INTEGRATION
   * Rationale: Reads hash from build system to ensure purge targets the
   * correct file version. This maintains tight coupling between build
   * and purge operations, preventing purging of wrong file versions.
   */
  const hash = (await fs.readFile(`build.hash`, `utf8`)).trim(); // Reads current build hash from filesystem
  
  /*
   * FILENAME CONSTRUCTION
   * Rationale: Constructs exact filename that build system generated.
   * This ensures cache purge targets the specific file users will request,
   * not a generic filename that might not exist in the CDN cache.
   */
   const file = `core.${hash}.min.css`; // Reconstructs hashed CSS filename for purge
  
  /*
   * PURGE EXECUTION
   * Rationale: Executes the actual cache invalidation and captures result
   * for verification. Status code enables calling scripts to verify
   * successful purge before considering deployment complete.
   */
  const code = await purgeCdn(file); // Initiates CDN purge and captures status
  console.log(`run is returning ${code}`); // Logs final status for monitoring
  return code; // Returns status code for programmatic verification
 } catch(err){
  if(err.code === `ENOENT`){
   qerrors(err, `run missing hash`, {args:process.argv.slice(2)}); // Logs missing build.hash error
   console.log(`run is returning 1`); // Reports missing file exit code
   return 1; // Returns error code instead of throwing
  }
  qerrors(err, `run failed`, {args:process.argv.slice(2)}); // Logs error with command line context
  throw err; // Re-throws error to signal purge failure to calling processes
 }
} // run function is exported but not executed automatically for manual control

module.exports = {purgeCdn, run}; // exports functions for unit testing and reuse

