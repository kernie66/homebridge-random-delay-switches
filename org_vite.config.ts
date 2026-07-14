import nkzw from '@nkzw/oxlint-config';
import { configDefaults, defineConfig } from 'vite-plus';

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
    ignorePatterns: ['dist/**'],
    //options: { typeAware: true, typeCheck: true },
    options: {
      reportUnusedDisableDirectives: 'warn',
    },
    rules: {
      'perfectionist/sort-objects': 'off', // Disable sorting of object properties to maintain logical grouping and readability
      'perfectionist/sort-object-types': 'off', // Disable sorting of object properties to maintain logical grouping and readability
      'perfectionist/sort-interfaces': 'off', // Disable sorting of interface members to maintain logical grouping and readability
      'unicorn/numeric-separators-style': [
        'error',
        {
          onlyIfContainsSeparator: true,
          minimumDigits: 6,
          hexadecimal: { groupLength: 4 },
        },
      ],
    },
  },
  staged: {
    '*': 'vp check --fix',
  },
  test: {
    coverage: {
      exclude: ['**/__tests__/**'],
      include: ['src/**/*.{ts,js}'],
    },
    exclude: [...configDefaults.exclude, 'dist/*'],
    globals: true,
    // setupFiles: './test/vitest.setup.ts',
  },
});
