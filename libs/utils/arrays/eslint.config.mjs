import baseConfig from '../../../eslint.config.mjs';

export default [
  {
    ignores: ['**/dist']
  },
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': 'error'
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser')
    }
  }
];
