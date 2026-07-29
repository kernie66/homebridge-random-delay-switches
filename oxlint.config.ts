import { defineConfig } from 'oxlint';

export default defineConfig({
  // Import nkzw from '@nkzw/oxlint-config';

  // Export default defineConfig({
  //   Extends: [nkzw],
  //   IgnorePatterns: ['**/*config.ts', 'node_modules', 'dist'],
  categories: {
    correctness: 'error',
    suspicious: 'warn',
    style: 'off',
  },
  options: {
    reportUnusedDisableDirectives: 'warn',
    typeAware: true,
    typeCheck: true,
  },
  rules: {
    // 'typescript/no-for-in-array': 'error',
    //     //   'no-undef': 'error', // Ensure that all variables are defined before use to prevent runtime errors
    'eslint/no-unused-vars': ['error', { fix: { imports: 'safe-fix', variables: 'off' } }],
    //     'prefer-default-export': 'warn', // Allow single named exports for better clarity and maintainability
    //     'perfectionist/sort-objects': 'off', // Disable sorting of object properties to maintain logical grouping and readability
    //     'perfectionist/sort-object-types': 'off', // Disable sorting of object properties to maintain logical grouping and readability
    //     'perfectionist/sort-interfaces': 'off', // Disable sorting of interface members to maintain logical grouping and readability
    //     'typescript/array-type': ['error', { default: 'array-simple' }],
    //     'typescript/consistent-type-imports': 'error',
    //     'typescript/no-explicit-any': 'error',
    //     'unicorn/numeric-separators-style': [
    //       'error',
    //       {
    //         Hexadecimal: { groupLength: 4 },
    //         Number: { minimumDigits: 6 },
    //       },
    //     ],
  },
});
