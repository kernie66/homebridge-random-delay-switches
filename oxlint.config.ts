import nkzw from '@nkzw/oxlint-config';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [nkzw],
  ignorePatterns: ['**/__tests__/*', '**/*config.ts', 'node_modules', 'dist'],
  // options: {
  //   typeAware: true,
  //   typeCheck: true,
  //   // reportUnusedDisableDirectives: 'warn',
  // },
  rules: {
    //   'no-undef': 'error', // Ensure that all variables are defined before use to prevent runtime errors
    'eslint/no-unused-vars': ['error', { fix: { imports: 'safe-fix', variables: 'off' } }],
    'prefer-default-export': 'warn', // Allow single named exports for better clarity and maintainability
    'perfectionist/sort-objects': 'off', // Disable sorting of object properties to maintain logical grouping and readability
    'perfectionist/sort-object-types': 'off', // Disable sorting of object properties to maintain logical grouping and readability
    'perfectionist/sort-interfaces': 'off', // Disable sorting of interface members to maintain logical grouping and readability
    'typescript/array-type': ['error', { default: 'array-simple' }],
    'typescript/consistent-type-imports': 'error',
    'typescript/no-explicit-any': 'error',
    'unicorn/numeric-separators-style': [
      'error',
      {
        hexadecimal: { groupLength: 4 },
        minimumDigits: 6,
        onlyIfContainsSeparator: true,
      },
    ],
  },
});
