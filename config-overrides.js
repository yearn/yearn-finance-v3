const { aliasWebpack, aliasJest } = require('react-app-alias');

const options = {
  baseUrl: './src',
};

module.exports = {
  webpack: function (config) {
    const modifiedConfig = aliasWebpack(options)(config);
    modifiedConfig.resolve.fallback = {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser'),
      path: require.resolve('path-browserify'),
    };
    return modifiedConfig;
  },
  jest: function (config) {
    const modifiedConfig = aliasJest(options)(config);
    return modifiedConfig;
  },
};
