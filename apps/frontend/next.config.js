//@ts-check
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false
  },

  reactStrictMode: true,

  compiler: {
    emotion: true
  },

  transpilePackages: ['@mui/x-data-grid', '@mui/material-nextjs'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.nyc3.digitaloceanspaces.com'
      },
      {
        protocol: 'https',
        hostname: 'emojicdn.elk.sh'
      }
    ]
  },

  i18n: {
    locales: ['he', 'en'],
    defaultLocale: 'he'
  }
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx
];

module.exports = composePlugins(...plugins)(nextConfig);
