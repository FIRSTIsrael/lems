/* eslint-disable @typescript-eslint/no-require-imports */
//@ts-check
const { composePlugins, withNx } = require('@nx/next');
const createNextIntlPlugin = require('next-intl/plugin');
const configValues = {
  default: {},
  development: {}
};
const configuration = process.env.NX_TASK_TARGET_CONFIGURATION || 'default';
const options = {
  ...configValues.default,
  // @ts-expect-error: Ignore TypeScript error for indexing configValues with a dynamic key
  ...configValues[configuration]
};
// The removed @nx/next:build executor wrote production builds to
// dist/apps/frontend/.next (read by the Dockerfile and deploy workflows), while
// development builds and `next dev` used the in-project .next directory.
const distDir =
  configuration === 'development' || process.env.NODE_ENV === 'development'
    ? '.next'
    : '../../dist/apps/frontend/.next';
/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: { ...options },
  distDir,
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
