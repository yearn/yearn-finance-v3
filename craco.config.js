const CracoAlias = require('craco-alias');

module.exports = {
  babel: {
    plugins: [
      ['babel-plugin-styled-components', {
        'minify': false,
        'transpileTemplateLiterals': false
      }]
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
