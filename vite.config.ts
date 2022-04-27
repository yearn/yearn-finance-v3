import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import react from '@vitejs/plugin-react'
import svgrPlugin from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  build: {
    outDir: 'build',
  },
  plugins: [
    react(),
    tsconfigPaths(),
    // reactRefresh(),
    svgrPlugin({
      svgrOptions: {
        icon: true,
        // ...svgr options (https://react-svgr.com/docs/options/)
      },
    }),
    // builtins({ crypto: true }),
  ],
  resolve: {
    alias: {
      "@ledgerhq/iframe-provider": require.resolve('@ledgerhq/iframe-provider'),
      "@yfi/sdk": require.resolve('@yfi/sdk'),
      "@ensdomains/address-encoder": require.resolve("@ensdomains/address-encoder/lib/index.umd.js"),
      // 'crypto': 'crypto-browserify',
      // http: require.resolve('rollup-plugin-node-builtins'),
      // util: require.resolve('rollup-plugin-node-builtins'),
      // stream: require.resolve('rollup-plugin-node-builtins'),
      // buffer: require.resolve('rollup-plugin-node-builtins'),
      // process: require.resolve('rollup-plugin-node-builtins'),
      // url: require.resolve('rollup-plugin-node-builtins'),
      // querystring: require.resolve('rollup-plugin-node-builtins'),
    },
  },
})