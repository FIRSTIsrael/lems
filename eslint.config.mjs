import { defineConfig, globalIgnores } from 'eslint/config';
import eslintReact from '@eslint-react/eslint-plugin';
import nextPlugin from '@next/eslint-plugin-next';
import nx from '@nx/eslint-plugin';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';

const reactFiles = [
  'apps/{frontend,admin,portal}/**/*.{js,jsx,ts,tsx}',
  'libs/{shared,presentations,localization}/**/*.{js,jsx,ts,tsx}'
];

const config = defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@nx': nx,
      import: importPlugin
    },
    rules: {
      // Import rules
      'import/no-unresolved': 'off', // Disabled for now since its not detecting @lems imports
      'import/no-duplicates': 'warn',
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'never'
        }
      ],

      // Override some base rules for TypeScript
      'no-unused-vars': 'off', // Use TypeScript version instead
      'no-undef': 'off', // TypeScript handles this

      // Nx rules
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*']
            }
          ]
        }
      ]
    }
  },
  {
    files: reactFiles,
    settings: {
      next: {
        rootDir: ['apps/frontend/', 'apps/admin/', 'apps/portal/']
      }
    },
    extends: [eslintReact.configs['recommended-typescript']],
    plugins: {
      'react-hooks': reactHooks,
      '@next/next': nextPlugin,
      'jsx-a11y': jsxA11y
    },
    rules: {
      // React Hooks rules
      ...reactHooks.configs['recommended-latest'].rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/error-boundaries': 'off',

      // Next.js rules
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      '@next/next/no-html-link-for-pages': [
        'error',
        ['apps/frontend', 'apps/admin', 'apps/portal']
      ],

      // JSX Accessibility rules
      'jsx-a11y/anchor-is-valid': [
        'error',
        {
          components: ['Link'],
          specialLink: ['hrefLeft', 'hrefRight'],
          aspects: ['invalidHref', 'preferButton']
        }
      ],
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/img-redundant-alt': 'warn'
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // TypeScript-specific rules - placed after base configs to override
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  },
  {
    files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.spec.js', '**/*.spec.jsx'],
    rules: {}
  },
  globalIgnores([
    '**/node_modules',
    '**/.next',
    'apps/backend/webpack.config.js',
    './eslint.config.mjs',
    '**/next-env.d.ts',
    '**/dist',
    '**/build',
    '**/out',
    '**/coverage',
    '**/.turbo',
    '**/.cache',
    '**/.vercel',
    '**/.idea',
    '**/.vscode',
    '**/.git'
  ])
]);

export default config;
