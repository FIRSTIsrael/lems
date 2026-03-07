/* eslint-disable @typescript-eslint/no-require-imports */

//@ts-check
const { composePlugins, withNx } = require('@nx/next');
const createNextIntlPlugin = require('next-intl/plugin');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {},

  output: 'standalone',

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
      },
      {
        protocol: 'https',
        hostname: '**.digitaloceanspaces.com'
      }
    ],
    localPatterns: [
      {
        pathname: '/assets/**'
      }
    ]
  },

  reactCompiler: true
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
  createNextIntlPlugin()
];

module.exports = composePlugins(...plugins)(nextConfig);
