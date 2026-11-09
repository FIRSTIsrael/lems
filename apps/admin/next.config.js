/* eslint-disable @typescript-eslint/no-require-imports */
//@ts-check
const createNextIntlPlugin = require('next-intl/plugin');
const configuration = process.env.NX_TASK_TARGET_CONFIGURATION || 'default';
// The removed @nx/next:build executor wrote production builds to
// dist/apps/admin/.next (read by the Dockerfile and deploy workflows), while
// development builds and `next dev` used the in-project .next directory.
const distDir =
  configuration === 'development' || process.env.NODE_ENV === 'development'
    ? '.next'
    : '../../dist/apps/admin/.next';
/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  distDir,
  output: 'standalone',
  basePath: '/admin',
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
    ],
    localPatterns: [
      {
        pathname: '/assets/**'
      }
    ]
  },
  reactCompiler: true
};
const withNextIntl = createNextIntlPlugin();
module.exports = withNextIntl(nextConfig);
