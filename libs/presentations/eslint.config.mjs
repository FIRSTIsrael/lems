import baseConfig from '../../eslint.config.mjs';

const config = [
  {
    ignores: ['**/dist']
  },
  ...baseConfig
];

export default config;
