import { defineConfig } from 'oxfmt';

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
});
