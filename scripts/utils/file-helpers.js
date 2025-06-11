/*
 * FILE SYSTEM HELPER UTILITIES
 * 
 * PURPOSE AND RATIONALE:
 * This utility centralizes common file operations used across build and
 * deployment scripts. It eliminates code duplication while providing
 * consistent error handling and logging for file system operations.
 * 
 * DESIGN STRATEGY:
 * - Consistent error handling across all file operations
 * - Centralized hash file reading with validation
 * - Reusable file existence checks with proper error context
 * - Promise-based API for clean async/await integration
 */

const fs = require('fs').promises; // Promise-based file system operations
const qerrors = require('qerrors'); // Centralized error logging

/**
 * BUILD HASH FILE READER
 * 
 * @returns {Promise<string>} Current build hash or empty string if unavailable
 * 
 * HASH READING STRATEGY:
 * - Reads build.hash file created by build process
 * - Returns trimmed hash string for filename construction
 * - Gracefully handles missing file without throwing errors
 * - Enables hash-based cache busting across multiple scripts
 */
async function readBuildHash() {
  try {
    const hash = await fs.readFile('build.hash', 'utf8'); // Read hash file content
    return hash.trim(); // Remove any whitespace from hash
  } catch (err) {
    if (err.code === 'ENOENT') {
      return ''; // Return empty string when hash file doesn't exist
    }
    qerrors(err, 'Failed to read build hash', { filename: 'build.hash' }); // Log unexpected errors
    return ''; // Return empty string for any read failure
  }
}

/**
 * FILE EXISTENCE CHECKER
 * 
 * @param {string} filepath - Path to file to check
 * @returns {Promise<boolean>} True if file exists and is accessible
 * 
 * EXISTENCE CHECK STRATEGY:
 * - Uses fs.access() for reliable existence checking
 * - Returns boolean rather than throwing for easier error handling
 * - Handles permission errors gracefully
 * - Provides consistent API across different file operations
 */
async function fileExists(filepath) {
  try {
    await fs.access(filepath); // Check file accessibility
    return true; // File exists and is accessible
  } catch (err) {
    return false; // File doesn't exist or isn't accessible
  }
}

/**
 * SAFE FILE READER WITH ERROR HANDLING
 * 
 * @param {string} filepath - Path to file to read
 * @param {string} encoding - File encoding (default: 'utf8')
 * @param {string} defaultContent - Content to return if file doesn't exist
 * @returns {Promise<string>} File content or default content
 * 
 * SAFE READING STRATEGY:
 * - Provides fallback content when file doesn't exist
 * - Logs errors for debugging without throwing
 * - Consistent error handling across different file types
 * - Enables graceful degradation when files are missing
 */
async function readFileWithDefault(filepath, encoding = 'utf8', defaultContent = '') {
  try {
    const content = await fs.readFile(filepath, encoding); // Read file with specified encoding
    return content; // Return file content
  } catch (err) {
    if (err.code !== 'ENOENT') {
      qerrors(err, 'Failed to read file', { filepath, encoding }); // Log unexpected errors
    }
    return defaultContent; // Return default content for missing files or errors
  }
}

module.exports = {
  readBuildHash, // exposes cached hash retrieval for build and deploy scripts
  fileExists, // provides reusable existence check to avoid fs duplication
  readFileWithDefault // exports safe reader so scripts can gracefully handle missing files
};