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
  const parsed = parseInt(process.env[envVar], 10); // Parse environment variable as integer
  
  // Return default for any parsing failure or range violation
  if (Number.isNaN(parsed) || parsed < minValue || parsed > maxValue) {
    return defaultValue;
  }
  
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
  const value = process.env[envVar]; // Read environment variable
  return value && value.trim() ? value.trim() : defaultValue; // Return trimmed value or default
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
  const value = process.env[envVar]; // Read environment variable
  if (!value) return defaultValue; // Return default when undefined
  
  const truthyValues = ['true', '1', 'yes', 'on']; // Standard truthy string representations
  return truthyValues.includes(value.toLowerCase().trim()); // Case-insensitive boolean parsing
}

module.exports = {
  parseEnvInt,
  parseEnvString,
  parseEnvBool
};