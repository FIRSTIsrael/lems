const { composePlugins, withNx } = require('@nx/webpack');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), config => {
  // Copy .graphql files to the dist folder
  config.plugins.push(
    new CopyPlugin({
      patterns: [
        {
          from: path.join(__dirname, 'src/lib/graphql/schema'),
          to: path.join(__dirname, '../../dist/apps/backend/schema'),
          globOptions: {
            ignore: ['**/index.ts'],
          },
        },
      ],
    })
  );

  return config;
});
