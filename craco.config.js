const CracoAlias = require('craco-alias');
require('react-scripts/config/env');

const REACT_APP = /^REACT_APP_/i;

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
    ],
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
