import baseConfig from '../../eslint.config.mjs';

export default [
  {
    ignores: ['.next/**/*', '**/dist']
  },
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@next/next/no-html-link-for-pages': ['error', 'apps/frontend/pages']
    }
  }
];
