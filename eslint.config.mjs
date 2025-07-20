import nx from '@nx/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import reactPlugin from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [
  {
    ignores: [
      '**/node_modules',
      '**/.next',
      'apps/backend/webpack.config.js',
      './eslint.config.mjs',
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
    ]
  },
  reactHooks.configs['recommended-latest'],
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  importPlugin.flatConfigs.recommended,
  {
    settings: {
      'import/resolver': {
        typescript: true,
        node: true
      },
      react: {
        version: 'detect'
      }
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      'react/prop-types': 'off',
      "import/no-unresolved": "off" //Disabled for now since its not detecting @lems imports
    }
  },
  {
    plugins: {
      '@nx': nx
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],

    rules: {
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
  ...compat.extends('plugin:@nx/typescript'),
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  },
  {
    files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.spec.js', '**/*.spec.jsx'],
    rules: {}
  }
];
