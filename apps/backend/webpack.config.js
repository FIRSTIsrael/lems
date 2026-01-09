const { composePlugins, withNx } = require('@nx/webpack');
const { PinoWebpackPlugin } = require('pino-webpack-plugin');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), config => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`
  config.plugins.push(new PinoWebpackPlugin({ transports: ['pino-pretty'] }));
  return config;
});
