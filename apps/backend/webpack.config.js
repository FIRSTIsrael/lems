const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { PinoWebpackPlugin } = require('pino-webpack-plugin');

// These options were migrated by @nx/webpack:convert-to-inferred from
// the project.json file and merged with the options in this file
const configValues = {
  build: {
    default: {
      target: 'node',
      compiler: 'tsc',
      outputPath: '../../dist/apps/backend',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      // Match the removed @nx/webpack:webpack executor output: an unhashed,
      // unminified main.js without source maps (the Dockerfile runs main.js).
      outputHashing: 'none',
      optimization: false,
      sourceMap: false,
      assets: [
        './src/assets',
        {
          glob: '**/*.graphql',
          input: '../../libs/types/src/lib/api/lems/graphql',
          output: 'graphql'
        }
      ]
    },
    production: { generatePackageJson: true }
  }
};

// Determine the correct configValue to use based on the configuration
const configuration = process.env.NX_TASK_TARGET_CONFIGURATION || 'default';

const buildOptions = {
  ...configValues.build.default,
  ...configValues.build[configuration]
};

/**
 * @type{import('webpack').WebpackOptionsNormalized}
 */
module.exports = async () => ({
  plugins: [
    new NxAppWebpackPlugin(buildOptions),
    new PinoWebpackPlugin({ transports: ['pino-pretty'] })
  ]
});
