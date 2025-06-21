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

  transpilePackages: ['@mui/x-data-grid'],

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
  withNx
];

module.exports = composePlugins(...plugins)(nextConfig);
