const HtmlWebpackPlugin = require('html-webpack-plugin');
const SriPlugin = require('webpack-subresource-integrity');
const CracoAlias = require('craco-alias');

const metaConfig = require('./meta.config');

require('react-scripts/config/env');

const REACT_APP = /^REACT_APP_/i;
const isProd = process.env.NODE_ENV === 'production';
const isVeYfiEnv = process.env.REACT_APP_USE_VEYFI_ROUTES === 'true';

// NOTE: orders REACT_APP_ environment variables in alphabetical order for consistent build bundle
const reactAppProcessEnv = Object.keys(process.env)
  .filter((key) => REACT_APP.test(key))
  .sort()
  .reduce((env, key) => {
    env[key] = process.env[key];
    return env;
  }, {});
Object.keys(reactAppProcessEnv).forEach((key) => {
  delete process.env[key];
  process.env[key] = reactAppProcessEnv[key];
});

module.exports = {
  babel: {
    plugins: [
      [
        'babel-plugin-styled-components',
        {
          minify: false,
          transpileTemplateLiterals: false,
        },
      ],
      ['@babel/plugin-proposal-class-properties'],
    ],
  },
  webpack: {
    plugins: {
      add: [
        new SriPlugin({
          hashFuncNames: ['sha256', 'sha384'],
          enabled: isProd,
        }),
      ],
    },
    configure: (webpackConfig, { env, paths }) => {
      const htmlWebpackPluginInstance = webpackConfig.plugins.find((plugin) => plugin instanceof HtmlWebpackPlugin);
      if (htmlWebpackPluginInstance) {
        const { title, meta } = metaConfig.getHtmlConfig(isVeYfiEnv);
        htmlWebpackPluginInstance.options.title = title;
        htmlWebpackPluginInstance.options.meta = meta;
      }
      // Webpack build issue with ledger package
      // https://github.com/LedgerHQ/ledger-live/issues/763
      webpackConfig.resolve = {
        ...webpackConfig.resolve,
        alias: {
          ...webpackConfig.resolve.alias,
          '@ledgerhq/devices/hid-framing': '@ledgerhq/devices/lib/hid-framing',
        },
      };
      if (isProd) webpackConfig.output.crossOriginLoading = 'anonymous';
      return webpackConfig;
    },
  },
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: 'tsconfig',
        baseUrl: './src',
        tsConfigPath: './tsconfig.paths.json',
      },
    },
  ],
};
