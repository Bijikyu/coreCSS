
/*
 * HTML UPDATE SCRIPT - DYNAMIC ASSET REFERENCE MANAGEMENT
 * 
 * PURPOSE AND RATIONALE:
 * This script solves the challenge of keeping HTML asset references synchronized
 * with the build system's hash-based cache busting strategy. It performs two
 * critical functions:
 * 
 * 1. HASH SYNCHRONIZATION: Updates CSS file references to match the current build hash
 * 2. CDN TEMPLATING: Replaces CDN placeholder tokens with actual URLs for flexibility
 * 
 * DESIGN DECISIONS:
 * - Reads hash from build.hash file to maintain loose coupling with build script
 * - Uses regex replacement to handle multiple references in a single pass
 * - Environment variable override allows different CDN endpoints (staging/production)
 * - Placeholder templating enables runtime CDN switching without code changes
 * 
 * This approach enables seamless integration between build system and deployment
 * while supporting multiple deployment environments with different CDN configurations.
 */

const fs = require('fs').promises; // File system operations using promises for consistent async patterns
const qerrors = require('qerrors'); // Centralized error logging with contextual information

/*
 * HTML UPDATE FUNCTION
 * 
 * PROCESS FLOW:
 * 1. Read current build hash from persistent storage
 * 2. Read existing HTML content
 * 3. Replace CSS filename references with current hash
 * 4. Replace CDN placeholder with actual CDN URL
 * 5. Write updated HTML back to file
 * 
 * ERROR HANDLING:
 * Comprehensive try/catch with detailed logging enables debugging of file system
 * issues, missing dependencies, or regex replacement failures.
 */
async function updateHtml(){ 
 console.log(`updateHtml is running with ${process.argv.length}`); // Logs function entry for debugging and monitoring
 try {

  /*
   * HASH RETRIEVAL
   * Rationale: Reading from build.hash file creates loose coupling between build
   * and HTML update processes. This allows build script to run independently
   * and HTML updates to happen later in the deployment pipeline.
   * trim() removes any whitespace that might interfere with filename generation.
   */
  const hash = (await fs.readFile('build.hash','utf8')).trim(); // Reads current build hash for filename replacement
  
  /*
   * HTML CONTENT LOADING
   * Rationale: Loading entire file into memory is acceptable for HTML files
   * which are typically small. This enables string manipulation operations
   * that would be complex with streaming approaches.
   */
  const html = await fs.readFile('index.html','utf8'); // Loads HTML content into memory for editing
  
  /*
   * CDN URL CONFIGURATION
   * Rationale: Environment variable override enables different CDN endpoints
   * for different deployment environments (development, staging, production).
   * jsDelivr chosen as default for its reliability and global CDN presence.
   */
  const cdnUrl = process.env.CDN_BASE_URL || `https://cdn.jsdelivr.net`; // Allows environment-defined CDN URL
  
  /*
   * CSS HASH REPLACEMENT
   * Rationale: Regex pattern matches any CSS file with 8-character hex hash.
   * Global flag (g) ensures all references in the file are updated in one pass.
   * This handles cases where CSS is referenced multiple times (preload, link, etc.).
   */
  let updated; //(declare variable for updated html)
  if(/core\.[a-f0-9]{8}\.min\.css/.test(html)){ //(detect existing hashed reference)
   updated = html.replace(/core\.[a-f0-9]{8}\.min\.css/g, `core.${hash}.min.css`); //(update existing hash)
  } else {
   updated = html.replace(/qore\.css/g, `core.${hash}.min.css`); //(replace qore.css when no hashed filename)
  }
  
  /*
   * CDN PLACEHOLDER SUBSTITUTION
   * Rationale: Template placeholders ({{CDN_BASE_URL}}) enable runtime CDN switching
   * without requiring code changes. This supports:
   * - Development with local files
   * - Staging with staging CDN
   * - Production with production CDN
   * Global replacement ensures all CDN references are consistent.
   */
  updated = updated.replace(/\{\{CDN_BASE_URL\}\}/g, cdnUrl); // Replaces CDN placeholder with actual URL
  
  /*
   * HTML FILE UPDATE
   * Rationale: Writing back to the same file updates references in place.
   * This maintains file permissions and any other metadata while updating content.
   */
  await fs.writeFile('index.html', updated); // Persists updated HTML to disk

  console.log(`updateHtml has run resulting in core.${hash}.min.css`); // Logs successful completion with resulting filename
  console.log(`updateHtml is returning ${hash}`); // Logs return value for debugging
  return hash; // Returns hash for programmatic usage by calling scripts
 } catch(err){
  qerrors(err, 'updateHtml failed', {args:process.argv.slice(2)}); // Logs error with command line arguments for context
  throw err; // Re-throws error to allow caller to handle or fail appropriately
 }
}

/*
 * DIRECT EXECUTION HANDLER
 * Rationale: Enables script to be called from command line (npm scripts, CI/CD)
 * while remaining importable as a module. Proper error handling ensures
 * calling processes receive appropriate exit codes.
 */
if(require.main === module){ 
 updateHtml().catch(err => { // Handles async function failures when run directly
  qerrors(err, 'updateHtml script failure', {args:process.argv.slice(2)}); // Logs failure context for debugging
  process.exitCode = 1; // Sets failure exit code for calling processes (CI/CD systems)
 });
}

module.exports = updateHtml; // Exports function for use by other scripts in the build pipeline
