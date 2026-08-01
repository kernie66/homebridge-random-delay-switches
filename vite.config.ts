// import nkzw from '@nkzw/oxlint-config';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  fmt: {
    arrowParens: 'always',
    bracketSpacing: true,
    jsPlugins: ['eslint-plugin-unused-imports'],
    jsxBracketSameLine: false,
    printWidth: 120,
    quoteProps: 'as-needed',
    semi: true,
    singleQuote: true,
    sortImports: {
      groups: [
        'type-import',
        ['value-builtin', 'value-external'],
        'type-internal',
        'value-internal',
        ['type-parent', 'type-sibling', 'type-index'],
        ['value-parent', 'value-sibling', 'value-index'],
        'unknown',
      ],
    },
    tabWidth: 2,
    trailingComma: 'all',
    useTabs: false,
  },
  lint: {
    // extends: [nkzw],
    // ignorePatterns: ['**/__tests__/*', '**/*config.ts', 'node_modules', 'dist'],
    ignorePatterns: ['node_modules', 'dist'],
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
    jsPlugins: ['eslint-plugin-no-only-tests', 'eslint-plugin-perfectionist'],
    plugins: ['typescript', 'import', 'unicorn', 'vitest'],
    rules: {
      'eslint/no-unused-vars': ['error', { fix: { imports: 'safe-fix', variables: 'off' } }],
      'prefer-default-export': 'warn', // Allow single named exports for better clarity and maintainability
      'perfectionist/sort-objects': 'off', // Disable sorting of object properties to maintain logical grouping and readability
      'perfectionist/sort-object-types': 'off', // Disable sorting of object properties to maintain logical grouping and readability
      'perfectionist/sort-interfaces': 'off', // Disable sorting of interface members to maintain logical grouping and readability
      'typescript/array-type': ['error', { default: 'array-simple' }],
      'typescript/consistent-type-imports': 'error',
      'typescript/no-explicit-any': 'error',
      'unicorn/no-array-reverse': 'off',
      'unicorn/numeric-separators-style': [
        'error',
        {
          hexadecimal: { groupLength: 4 },
          number: { minimumDigits: 6 },
        },
      ],
    },
  },
  test: {
    exclude: ['dist', 'node_modules'],
  },
  staged: {
    '*': 'vp check --fix',
    // '*': 'vp fmt',
  },
});
