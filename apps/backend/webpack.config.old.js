const { PinoWebpackPlugin } = require('pino-webpack-plugin');
// Nx plugins for webpack.
module.exports = composeLegacyPlugins(config => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`
  config.plugins.push(new PinoWebpackPlugin({ transports: ['pino-pretty'] }));
  return config;
});
function composeLegacyPlugins(...plugins) {
  return async (config, ctx) => {
    for (const plugin of plugins) {
      config = await (await plugin)(config, ctx);
    }
    return config;
  };
}
