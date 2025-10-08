/* eslint-disable @typescript-eslint/no-require-imports */

const isProduction = process.env.NODE_ENV === 'production';

//@ts-check
const { composePlugins, withNx } = require('@nx/next');
const createNextIntlPlugin = require('next-intl/plugin');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false
  },

  output: 'standalone',

  basePath: isProduction ? '/admin' : undefined,

  reactStrictMode: true,

  compiler: {
    emotion: {
      sourceMap: true,
      autoLabel: 'dev-only',
      labelFormat: '[local]'
    }
  },

  transpilePackages: ['@mui/x-data-grid', '@mui/material-nextjs'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'emojicdn.elk.sh'
      }
    ]
  }
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
  createNextIntlPlugin()
];

module.exports = composePlugins(...plugins)(nextConfig);
