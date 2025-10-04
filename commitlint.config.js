/**
 * Commitlint configuration
 * Enforces conventional commit messages
 * @see https://commitlint.js.org
 */

module.exports = {
  extends: ['@commitlint/config-conventional'],
  
  rules: {
    // Enforce specific types
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation changes
        'style',    // Formatting, missing semicolons, etc.
        'refactor', // Code refactoring
        'perf',     // Performance improvements
        'test',     // Adding or updating tests
        'build',    // Build system or dependencies
        'ci',       // CI configuration
        'chore',    // Other changes
        'revert',   // Revert a previous commit
        'security', // Security improvements
      ],
    ],
    
    // Scope is optional
    'scope-enum': [
      0, // Disabled - allow any scope
    ],
    
    // Subject should not end with period
    'subject-full-stop': [2, 'never', '.'],
    
    // Subject should not be empty
    'subject-empty': [2, 'never'],
    
    // Subject should be lowercase
    'subject-case': [2, 'always', 'lower-case'],
    
    // Type should not be empty
    'type-empty': [2, 'never'],
    
    // Type should be lowercase
    'type-case': [2, 'always', 'lower-case'],
    
    // Header max length
    'header-max-length': [2, 'always', 100],
    
    // Body max line length
    'body-max-line-length': [2, 'always', 100],
    
    // Footer max line length
    'footer-max-line-length': [2, 'always', 100],
  },
};

