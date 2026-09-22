// @ts-check
import js from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// T-008: file-size and function-size limits (brief section 5.2).
const MAX_LINES = 300; // ESLint fails the build above this; tests/structure enforces the stricter 250-line target.
const MAX_LINES_PER_FUNCTION = 50;
const MAX_LINES_TEST_FILE = 400; // brief section 5.2 allows 400-line tests, the outer describe() wraps the whole file.
const MAX_LINES_COMPONENT = 150;

// T-009: layout must use logical CSS properties only, so every screen works
// left-to-right and right-to-left. This catches physical-direction Tailwind
// classes in JSX className values.
const PHYSICAL_DIRECTION_CLASS =
  /(^|\s)(ml-|mr-|pl-|pr-|left-|right-|text-left|text-right|rounded-l-|rounded-r-|rounded-tl-|rounded-tr-|rounded-bl-|rounded-br-|border-l-|border-r-)/;

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      '.wrangler/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'migrations/**',
      'node_modules/**',
      'worker-configuration.d.ts',
    ],
  },
  { languageOptions: { ecmaVersion: 'latest', sourceType: 'module' } },
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [...tseslint.configs.strictTypeChecked, ...tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: {
        // tsconfig.web.json joins this list once src/web has real files; a TS
        // project with zero matching inputs fails to build (TS18003), which
        // would break linting for every file, not just web ones.
        project: ['./tsconfig.worker.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { boundaries },
    settings: {
      // eslint-plugin-boundaries resolves import specifiers with
      // eslint-import-resolver-node, which defaults to .js/.json/.node —
      // without this, every extension-less TS import fails to resolve and
      // boundaries rules silently see no target element to check.
      'import/resolver': {
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
      },
      'boundaries/elements': [
        { type: 'core', pattern: 'src/worker/core/*/**', capture: ['module'] },
        { type: 'service', pattern: 'src/worker/services/*/**', capture: ['service'] },
        { type: 'db-schema', pattern: 'src/db/schema/**' },
        { type: 'shared', pattern: 'src/shared/**' },
        { type: 'web', pattern: 'src/web/**' },
      ],
    },
    rules: {
      'max-lines': ['error', { max: MAX_LINES, skipBlankLines: false, skipComments: false }],
      'max-lines-per-function': [
        'error',
        { max: MAX_LINES_PER_FUNCTION, skipBlankLines: false, skipComments: false, IIFEs: true },
      ],
      // Brief section 5.3: each service has one index.ts; it is the only file
      // other services (or core modules) may import from.
      'boundaries/entry-point': [
        'error',
        {
          default: 'disallow',
          rules: [{ target: { element: { type: ['core', 'service'] } }, allow: 'index.ts' }],
        },
      ],
    },
  },
  prettierConfig,
  {
    // Brief section 5.3: core/ modules are shared by all services and never
    // import from a service.
    files: ['src/worker/core/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/services/**'],
              message: 'Core modules never import from a service (brief section 5.3).',
            },
          ],
        },
      ],
    },
  },
  {
    // Routes handle HTTP only; they never import a repo directly (brief section 5.3).
    files: ['src/worker/services/*/**/*.routes.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/*.repo', '**/*.repo.js'],
              message: 'Routes never import repos directly; call the service file instead.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/web/**/*.ts', 'src/web/**/*.tsx'],
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    languageOptions: { globals: globals.browser },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['error', { allowConstantExport: true }],
      // Web code never reaches into the worker directly; it talks to the API only.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/worker/**'],
              message: 'The web app calls the API over HTTP; it never imports worker code.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/web/**/*.tsx'],
    rules: {
      'max-lines': [
        'error',
        { max: MAX_LINES_COMPONENT, skipBlankLines: false, skipComments: false },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: `JSXAttribute[name.name="className"] Literal[value=${String(PHYSICAL_DIRECTION_CLASS)}]`,
          message:
            'Use logical CSS properties (inline-start/inline-end), never physical-direction classes (brief section 28).',
        },
        {
          selector: `JSXAttribute[name.name="className"] TemplateElement[value.raw=${String(PHYSICAL_DIRECTION_CLASS)}]`,
          message:
            'Use logical CSS properties (inline-start/inline-end), never physical-direction classes (brief section 28).',
        },
      ],
    },
  },
  {
    files: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    languageOptions: { globals: { ...globals.node } },
    rules: {
      'max-lines': [
        'error',
        { max: MAX_LINES_TEST_FILE, skipBlankLines: false, skipComments: false },
      ],
      'max-lines-per-function': [
        'error',
        { max: MAX_LINES_TEST_FILE, skipBlankLines: false, skipComments: false, IIFEs: true },
      ],
    },
  },
  {
    files: ['*.config.ts', '*.config.js', 'drizzle.config.ts', 'eslint.config.js'],
    languageOptions: { globals: { ...globals.node } },
  },
);
