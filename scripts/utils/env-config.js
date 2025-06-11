/*
 * ENVIRONMENT CONFIGURATION UTILITY
 * 
 * PURPOSE AND RATIONALE:
 * This utility centralizes environment variable parsing and validation across
 * multiple scripts. It eliminates code duplication while ensuring consistent
 * validation rules and error handling for all environment-based configuration.
 * 
 * DESIGN STRATEGY:
 * - Single source of truth for environment variable parsing
 * - Consistent range validation with clear error messages
 * - Reusable across multiple scripts without duplication
 * - Type-safe parsing with proper fallback values
 */

/**
 * ENVIRONMENT VARIABLE PARSER WITH VALIDATION
 * 
 * @param {string} envVar - Environment variable name
 * @param {number} defaultValue - Default value when env var missing or invalid
 * @param {number} minValue - Minimum allowed value (inclusive)
 * @param {number} maxValue - Maximum allowed value (inclusive)
 * @returns {number} Validated integer value within specified range
 * 
 * VALIDATION STRATEGY:
 * - Parses environment variable as integer
 * - Validates range to prevent resource exhaustion or invalid configuration
 * - Returns default value for any validation failure
 * - Provides clear boundaries for safe operation
 */
function parseEnvInt(envVar, defaultValue, minValue = 1, maxValue = 1000) {
  console.log(`parseEnvInt is running with ${envVar},${defaultValue},${minValue},${maxValue}`); // entry log for debugging
  const parsed = parseInt(process.env[envVar], 10); // Parse environment variable as integer
  
  // Return default for any parsing failure or range violation
  if (Number.isNaN(parsed) || parsed < minValue || parsed > maxValue) {
    console.log(`parseEnvInt is returning ${defaultValue}`); // logs fallback value
    return defaultValue;
  }

  console.log(`parseEnvInt is returning ${parsed}`); // logs validated value
  return parsed; // Return validated value
}

/**
 * ENVIRONMENT VARIABLE READER WITH FALLBACK
 * 
 * @param {string} envVar - Environment variable name
 * @param {string} defaultValue - Default value when env var missing
 * @returns {string} Environment variable value or default
 * 
 * STRING CONFIGURATION STRATEGY:
 * - Provides simple string environment variable access
 * - Ensures non-empty strings or falls back to default
 * - Used for URLs, file paths, and other string configuration
 */
function parseEnvString(envVar, defaultValue) {
  console.log(`parseEnvString is running with ${envVar},${defaultValue}`); // entry log for debugging
  const value = process.env[envVar]; // Read environment variable
  const result = value && value.trim() ? value.trim() : defaultValue; // Determine result value
  console.log(`parseEnvString is returning ${result}`); // logs returned string
  return result; // Return trimmed value or default
}

/**
 * BOOLEAN ENVIRONMENT VARIABLE PARSER
 * 
 * @param {string} envVar - Environment variable name
 * @param {boolean} defaultValue - Default value when env var missing
 * @returns {boolean} Boolean interpretation of environment variable
 * 
 * BOOLEAN PARSING STRATEGY:
 * - Treats 'true', '1', 'yes', 'on' as true (case-insensitive)
 * - All other values including undefined treated as false unless default is true
 * - Enables flexible boolean configuration across different deployment environments
 */
function parseEnvBool(envVar, defaultValue = false) {
  console.log(`parseEnvBool is running with ${envVar},${defaultValue}`); // entry log for debugging
  const value = process.env[envVar]; // Read environment variable
  if (!value) {
    console.log(`parseEnvBool is returning ${defaultValue}`); // logs fallback value
    return defaultValue; // Return default when undefined
  }

  const truthyValues = ['true', '1', 'yes', 'on']; // Standard truthy string representations
  const result = truthyValues.includes(value.toLowerCase().trim()); // Case-insensitive boolean parsing
  console.log(`parseEnvBool is returning ${result}`); // logs boolean result
  return result; // Return parsed boolean
}

module.exports = {
  parseEnvInt,
  parseEnvString,
  parseEnvBool
};