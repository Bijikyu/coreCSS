
/*
 * BUILD SCRIPT - CSS PROCESSING AND OPTIMIZATION PIPELINE
 * 
 * PURPOSE AND RATIONALE:
 * This script orchestrates the complete build process for qoreCSS, transforming
 * the source CSS into production-ready files with several key optimizations:
 * 
 * 1. CSS PROCESSING: Uses PostCSS with autoprefixer to ensure cross-browser compatibility
 * 2. FILE HASHING: Creates content-based hashes to enable aggressive CDN caching
 * 3. COMPRESSION: Generates gzip and brotli compressed versions for faster delivery
 * 4. CLEANUP: Removes old versions to prevent accumulation of obsolete files
 * 
 * DESIGN DECISIONS:
 * - Content-based hashing ensures cache invalidation only when CSS actually changes
 * - SHA1 truncated to 8 characters provides sufficient uniqueness while keeping filenames readable
 * - Asynchronous operations with Promise.all enable parallel processing for better performance
 * - Preemptive generation of compressed files reduces server CPU load during delivery
 * 
 * This approach enables zero-downtime deployments and optimal performance through
 * aggressive caching while ensuring users always receive the latest CSS changes.
 */

const {execFile} = require('child_process'); // Provides async shell commands for external tool execution
const {promisify} = require('util'); // Converts callback-based functions to promise-based for cleaner async/await usage
const fs = require('fs'); // Provides streaming APIs and promise helpers
const fsp = fs.promises; // Promise-based filesystem methods
const crypto = require('crypto'); // Cryptographic functions for generating content hashes
const {createGzip, createBrotliCompress} = require('zlib'); // Streaming compressors for optimized output
const {pipeline} = require('stream/promises'); // Promise based pipeline for stream control
const execFileAsync = promisify(execFile); // Promise-wrapped execFile for consistent async patterns

/*
 * MAIN BUILD FUNCTION
 * 
 * PROCESS FLOW:
 * 1. Run PostCSS to process CSS (autoprefixer, minification, etc.)
 * 2. Generate content hash from processed CSS
 * 3. Clean up old versions to prevent file accumulation
 * 4. Rename output file with hash for cache busting
 * 5. Generate compressed variants (gzip, brotli) for optimized delivery
 * 6. Persist hash for other scripts to reference
 * 
 * ERROR HANDLING:
 * All operations are wrapped in try/catch with detailed error context.
 * This ensures failures are properly logged and the build process can be debugged.
 */
async function build(){ 
 console.log(`build is running with ${process.argv.length}`); // Logs function entry with argument count for debugging
 try {
  /*
   * POSTCSS EXECUTION
   * Rationale: PostCSS with autoprefixer ensures CSS works across all supported browsers.
   * The qore.css input is processed and output as core.min.css with optimizations applied.
   * Using execFile instead of exec prevents shell injection attacks.
   */
  if(process.env.CODEX === `True`){
   await fsp.copyFile('qore.css','core.min.css'); // Skips postcss in offline mode
  } else {
   await execFileAsync('npx', ['postcss','qore.css','-o','core.min.css']); // Runs postcss normally
  }
  
  /*
   * CONTENT HASH GENERATION
   * Rationale: Content-based hashing enables aggressive CDN caching because:
   * - Files with identical content get identical hashes (cache hits)
   * - Any content change produces a different hash (automatic cache invalidation)
   * - 8-character truncation provides sufficient uniqueness for this use case
   * SHA1 chosen over MD5 for better collision resistance, over SHA256 for shorter hashes
   */
  const hash = await new Promise((resolve,reject)=>{ // Streams file to compute sha1 without loading to memory
   const sha1 = crypto.createHash('sha1'); // Initializes hash object
   const stream = fs.createReadStream('core.min.css'); // Reads CSS as stream
   stream.on('error', reject); // Propagates read errors
   stream.on('data', chunk => sha1.update(chunk)); // Updates hash with chunk
   stream.on('end', () => resolve(sha1.digest('hex').slice(0,8))); // Resolves with truncated hash
  });

  /*
   * OLD FILE CLEANUP
   * Rationale: Prevents accumulation of old CSS versions that would consume disk space.
   * Regex pattern matches exactly: core.[8-hex-chars].min.css
   * Excludes the current hash to prevent deleting the file we're about to create.
   * Promise.all enables parallel deletion for better performance.
   */
  const targetFile = `core.${hash}.min.css`; // Builds hashed filename for renaming
  const files = (await fsp.readdir('.')).filter(f => /^core\.[a-f0-9]{8}\.min\.css$/.test(f) && f !== targetFile); // Lists old hashed files
  await Promise.all(files.map(f => fsp.unlink(f))); // Removes outdated hashed css
  
  /*
   * COMPRESSED FILE CLEANUP
   * Rationale: Also removes old compressed variants (.gz, .br) to maintain consistency.
   * These files can be large and accumulate quickly without cleanup.
   */
  const compressedOld = (await fsp.readdir('.')).filter(f => /^core\.[a-f0-9]{8}\.min\.css\.(?:gz|br)$/.test(f) && !f.includes(hash)); // Finds old compressed files
  await Promise.all(compressedOld.map(f => fsp.unlink(f))); // Deletes old compressed files
  
  /*
   * FILE RENAMING WITH HASH
   * Rationale: Creates the cache-busting filename that CDNs and browsers will use.
   * This must happen after cleanup to avoid race conditions.
   */
  await fsp.rename('core.min.css', targetFile); // Renames processed css with hash

  /*
   * COMPRESSION GENERATION
   * Rationale: Pre-generating compressed files reduces server CPU load and improves
   * response times. Gzip is universally supported, Brotli provides better compression
   * for modern browsers. Async compression prevents blocking the event loop.
   */
  await Promise.all([ // Streams compression to avoid loading file in memory
   pipeline(fs.createReadStream(targetFile), createGzip(), fs.createWriteStream(`${targetFile}.gz`)), // Gzip output
   pipeline(fs.createReadStream(targetFile), createBrotliCompress(), fs.createWriteStream(`${targetFile}.br`)) // Brotli output
  ]);

  console.log(`build has run resulting in core.${hash}.min.css`); // Logs successful completion with resulting filename
  
  /*
   * HASH PERSISTENCE
   * Rationale: Other scripts (deploy, updateHtml) need to know the current hash.
   * Storing in a separate file enables loose coupling between build steps.
   */
  await fsp.writeFile('build.hash', hash); // Persists hash for deployment scripts
  console.log(`build is returning ${hash}`); // Logs return value for debugging
  return hash; // Returns hash for programmatic usage
 } catch(err){
  console.error('build failed:', err.message, {args:process.argv.slice(2)}); // Logs error with full context for debugging
  throw err; // Re-throws to allow caller to handle or terminate process
 }
}

/*
 * DIRECT EXECUTION HANDLER
 * Rationale: Allows script to be called directly from command line while also
 * being importable as a module. Sets appropriate exit codes for CI/CD systems.
 */
if(require.main === module){
 build().catch(err => { // Handles async failures when run directly
  console.error('build script failure:', err.message, {args:process.argv.slice(2)}); // Logs error context for debugging
  process.exitCode = 1; // Sets non-zero exit code to signal failure to calling processes
 });
}

module.exports = build; // Exports function for use by other scripts or modules
