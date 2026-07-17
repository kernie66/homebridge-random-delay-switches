import nkzw from '@nkzw/oxlint-config';
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
    extends: [nkzw],
    ignorePatterns: ['**/__tests__/*', '**/*config.ts', 'node_modules', 'dist'],
    rules: {
      'perfectionist/sort-objects': 'off', // Disable sorting of object properties to maintain logical grouping and readability
      'perfectionist/sort-object-types': 'off', // Disable sorting of object properties to maintain logical grouping and readability
      'perfectionist/sort-interfaces': 'off', // Disable sorting of interface members to maintain logical grouping and readability
      'unicorn/numeric-separators-style': [
        'error',
        {
          hexadecimal: { groupLength: 4 },
          minimumDigits: 6,
          onlyIfContainsSeparator: true,
        },
      ],
    },
    options: { typeAware: true, typeCheck: true },
  },
  staged: {
    // '*': 'vp check --fix',
    '*': 'vp fmt',
  },
});
