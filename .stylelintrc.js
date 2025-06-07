
/*
 * STYLELINT CONFIGURATION - CSS CODE QUALITY AND CONSISTENCY ENFORCEMENT
 * 
 * PURPOSE AND RATIONALE:
 * This configuration establishes comprehensive CSS linting rules to maintain
 * code quality, consistency, and best practices across the qoreCSS framework.
 * Stylelint chosen over alternatives for several reasons:
 * 
 * 1. COMPREHENSIVE RULES: Covers syntax, style, and best practice validation
 * 2. MODERN CSS SUPPORT: Handles latest CSS features and specifications
 * 3. CUSTOMIZABLE: Highly configurable rule system for specific project needs
 * 4. ECOSYSTEM INTEGRATION: Works with editors, CI/CD, and build tools
 * 
 * CONFIGURATION STRATEGY:
 * Uses standard config as base with project-specific overrides to balance
 * strict quality enforcement with practical development workflows.
 */

module.exports = {
  /*
   * BASE CONFIGURATION INHERITANCE
   * 
   * STANDARD CONFIG RATIONALE:
   * 'stylelint-config-standard' provides a comprehensive set of rules that
   * enforce CSS best practices and catch common errors. It includes:
   * - Syntax validation (proper CSS structure)
   * - Style consistency (indentation, spacing, quotes)
   * - Best practice enforcement (no duplicate selectors, etc.)
   * 
   * This foundation ensures high code quality without requiring manual
   * configuration of hundreds of individual rules.
   */
  extends: ['stylelint-config-standard'],

  /*
   * PROJECT-SPECIFIC RULE OVERRIDES
   * 
   * CUSTOMIZATION RATIONALE:
   * While the standard config provides excellent defaults, specific project
   * requirements necessitate some rule modifications to accommodate the
   * qoreCSS framework's particular patterns and design decisions.
   */
  rules: {
    /*
     * COMMENT STYLE ENFORCEMENT
     * 
     * RULE: 'comment-empty-line-before'
     * SETTING: 'never'
     * 
     * RATIONALE: This project uses extensive inline commenting for documentation
     * and explanation. Requiring empty lines before comments would significantly
     * increase file length and reduce code density, making it harder to see
     * related CSS and its documentation together.
     * 
     * TRADEOFF: Slightly reduces visual separation between comment blocks
     * but enables tighter coupling of documentation with relevant code.
     */
    'comment-empty-line-before': 'never',

    /*
     * VENDOR PREFIX VALIDATION OVERRIDE
     * 
     * RULE: 'value-no-vendor-prefix'
     * SETTING: null (disabled)
     * 
     * RATIONALE: While autoprefixer handles most vendor prefixes automatically,
     * certain CSS properties require manual vendor prefixes for optimal
     * browser compatibility, especially for newer or experimental features.
     * 
     * EXAMPLES OF NECESSARY MANUAL PREFIXES:
     * - -webkit-font-smoothing (not covered by autoprefixer)
     * - -moz-osx-font-smoothing (Mozilla-specific font rendering)
     * - -webkit-appearance (form element styling)
     * 
     * Disabling this rule allows strategic use of vendor prefixes while
     * still relying on autoprefixer for standard property prefixing.
     */
    'value-no-vendor-prefix': null,

    /*
     * PROPERTY VENDOR PREFIX VALIDATION OVERRIDE
     * 
     * RULE: 'property-no-vendor-prefix'
     * SETTING: null (disabled)
     * 
     * RATIONALE: Similar to value prefixes, some CSS properties require
     * manual vendor prefixes for specific browser compatibility needs
     * that autoprefixer doesn't handle or handles differently.
     * 
     * EXAMPLES:
     * - -webkit-backdrop-filter (limited autoprefixer support)
     * - -moz-user-select (Mozilla-specific user interaction)
     * 
     * This override provides flexibility for edge cases while maintaining
     * autoprefixer as the primary prefixing strategy.
     */
    'property-no-vendor-prefix': null,
  },
};
