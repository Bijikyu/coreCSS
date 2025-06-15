
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
const path = require('path'); // path module for absolute path resolution during concurrent updates
const qerrors = require('./utils/logger'); // Centralized error logging with contextual information
const {parseEnvString, trimTrailingSlashes} = require('./utils/env-config'); // standardizes CDN URL retrieval with fallback and trimming utility

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
  const cwd = process.cwd(); // captures working directory at invocation for concurrency safety

  /*
   * HASH RETRIEVAL
   * Rationale: Reading from build.hash file creates loose coupling between build
   * and HTML update processes. This allows build script to run independently
   * and HTML updates to happen later in the deployment pipeline.
   * trim() removes any whitespace that might interfere with filename generation.
   */
  const hashPath = path.join(cwd, 'build.hash'); // computes absolute path using captured cwd
  await fs.access(hashPath); // ensures hash file exists before reading for graceful error handling
  const hash = (await fs.readFile(hashPath,'utf8')).trim(); // Reads current build hash for filename replacement
  
  /*
   * HTML CONTENT LOADING
   * Rationale: Loading entire file into memory is acceptable for HTML files
   * which are typically small. This enables string manipulation operations
   * that would be complex with streaming approaches.
   * Verification prevents processing non-existent files.
   */
  const htmlPath = path.join(cwd, 'index.html'); // resolves html path from captured cwd
  await fs.access(htmlPath); // Verifies HTML file exists before processing
  const html = await fs.readFile(htmlPath,'utf8'); // Loads HTML content into memory for editing
  
  /*
   * CDN URL CONFIGURATION
   * Rationale: Environment variable override enables different CDN endpoints
   * for different deployment environments (development, staging, production).
   * jsDelivr chosen as default for its reliability and global CDN presence.
   */
  let cdnUrl = trimTrailingSlashes(parseEnvString('CDN_BASE_URL', 'https://cdn.jsdelivr.net')); // trims trailing slash characters for consistent urls
  if(cdnUrl.trim() === ''){ cdnUrl = 'https://cdn.jsdelivr.net'; } // ensures empty string falls back to default CDN
  
  /*
   * CSS HASH REPLACEMENT
   * Rationale: Single regex matches both qore.css and existing hashed filenames.
   * Global flag (g) ensures all references update in one pass for consistency.
   */
  let updated = html.replace(/(?:qore\.css|core\.[a-f0-9]{8}\.min\.css)/g, `core.${hash}.min.css`); // replaces any css reference with current hashed filename
  
  /*
   * CDN PLACEHOLDER SUBSTITUTION
   * Rationale: Template placeholders ({{CDN_BASE_URL}}) enable runtime CDN switching
   * without requiring code changes. This supports:
   * - Development with local files
   * - Staging with staging CDN
   * - Production with production CDN
   * Global replacement ensures all CDN references are consistent.
   */
  updated = updated.replace(/\{\{CDN_BASE_URL\}\}/g, () => cdnUrl); // passes function so "$" chars remain literal when inserting URL
  
  /*
   * HTML FILE UPDATE
   * Rationale: Writing back to the same file updates references in place.
   * This maintains file permissions and any other metadata while updating content.
   */
  await fs.writeFile(htmlPath, updated, 'utf8'); // Persists updated HTML using explicit UTF-8 encoding for cross-platform consistency

  console.log(`updateHtml has run resulting in core.${hash}.min.css`); // Logs successful completion with resulting filename
  console.log(`updateHtml is returning ${hash}`); // Logs return value for debugging
  return hash; // Returns hash for programmatic usage by calling scripts
 } catch(err){
  if(err.code === 'ENOENT' && err.path && path.basename(err.path) === 'build.hash'){ // verifies path exists before basename to avoid undefined errors
   qerrors(err, 'updateHtml missing hash', {args:process.argv.slice(2)}); // logs missing hash as recoverable scenario
   console.log('updateHtml is returning 1'); // communicates non-zero return for automation
   return 1; // signals missing build artifact while allowing caller to continue
  }
  if(err.code === 'ENOENT'){ // other ENOENT errors like index.html should surface
   qerrors(err, 'updateHtml file missing', {args:process.argv.slice(2)}); // logs missing file for caller handling
   throw err; // rethrows so tests and callers can detect fatal missing resources
  }
  qerrors(err, 'updateHtml failed', {args:process.argv.slice(2)}); // Logs unexpected errors with context for debugging
  throw err; // escalates unexpected failure for external handling
 }
}

/*
 * DIRECT EXECUTION HANDLER
 * Rationale: Enables script to be called from command line (npm scripts, CI/CD)
 * while remaining importable as a module. Proper error handling ensures
 * calling processes receive appropriate exit codes.
 */
if(require.main === module){
 updateHtml().then(code => { if(code === 1) process.exitCode = 1; }).catch(err => { // Checks return code then handles failures when executed directly
  qerrors(err, 'updateHtml script failure', {args:process.argv.slice(2)}); // Logs failure context for debugging
  process.exitCode = 1; // Ensures non-zero exit for CLI automation when errors occur
 });
}

module.exports = updateHtml; // Exports function for use by other scripts in the build pipeline
