// TODO: Remove craco-alias
// const CracoAlias = require('craco-alias');
const { CracoAliasPlugin } = require('react-app-alias');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
      };
      return webpackConfig;
    },
    // configure: {
    //   resolve: {
    //     fallback: {
    //       crypto: require.resolve('crypto-browserify'),
    //       stream: require.resolve('stream-browserify'),
    //       http: require.resolve('stream-http'),
    //       https: require.resolve('https-browserify'),
    //       os: require.resolve('os-browserify/browser'),
    //     },
    //   },
    // },
  },
  plugins: [
    {
      plugin: CracoAliasPlugin, // TODO: verify options needed
      options: {
        source: 'tsconfig',
        baseUrl: './src',
        tsConfigPath: './tsconfig.paths.json',
      },
    },
  ],
};
