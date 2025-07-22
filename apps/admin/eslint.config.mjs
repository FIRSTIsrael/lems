import baseConfig from '../../eslint.config.mjs';

export default [
  {
    ignores: ['.next/**/*', '**/dist']
  },
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      // Admin-specific rule overrides
    }
  }
];
