const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { useLegacyNxPlugin } = require('@nx/webpack');

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
    // NOTE: useLegacyNxPlugin ensures that the non-standard Webpack configuration file previously used still works.
    // To remove its usage, move options such as "plugins" into this file as standard Webpack configuration options.
    // To enhance configurations after Nx plugins have applied, you can add a new plugin with the \`apply\` method.
    // e.g. \`{ apply: (compiler) => { /* modify compiler.options */ }\`
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await useLegacyNxPlugin(require('./webpack.config.old.js'), buildOptions)
  ]
});
