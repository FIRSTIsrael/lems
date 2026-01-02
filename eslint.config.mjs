import { defineConfig, globalIgnores } from 'eslint/config';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import nx from '@nx/eslint-plugin';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

const config = defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...nextCoreWebVitals,
  ...nextTs,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    settings: {
      next: {
        rootDir: ['apps/frontend/', 'apps/admin/', 'apps/portal/']
      }
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
      '@nx': nx
    },
    rules: {
      // React Hooks rules - must be explicit to override inherited configs
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // React rules
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',

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

      '@next/next/no-html-link-for-pages': [
        'error',
        ['apps/frontend', 'apps/admin', 'apps/portal']
      ],

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
    files: ['**/*.tsx', '**/*.jsx'],
    rules: {
      // JSX Accessibility rules are already configured by next-core-web-vitals
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
