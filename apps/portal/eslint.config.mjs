import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import js from '@eslint/js';
import baseConfig from '../../eslint.config.mjs';

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
  recommendedConfig: js.configs.recommended
});

export default [
  {
    ignores: ['**/dist']
  },
  ...baseConfig,
  ...compat.extends('plugin:@nx/react-typescript', 'next', 'next/core-web-vitals'),
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@next/next/no-html-link-for-pages': ['error', 'apps/portal/pages'],
      'react/jsx-no-literals': 'warn'
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    // Override or add rules here
    rules: {}
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {}
  },
  {
    ignores: ['.next/**/*']
  }
];
