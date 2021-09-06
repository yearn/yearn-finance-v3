import { memoize } from 'lodash';

import { Env, EthereumNetwork } from '@types';

export const getEnv = memoize(
  (): Env => ({
    ENV: process.env.NODE_ENV,
    ETHEREUM_NETWORK: (process.env.REACT_APP_ETHEREUM_NETWORK ?? 'mainnet') as EthereumNetwork,
    CUSTOM_PROVIDER_HTTPS: process.env.REACT_APP_CUSTOM_PROVIDER_HTTPS ?? 'http://127.0.0.1:8545/',
    USE_MAINNET_FORK: process.env.REACT_APP_USE_MAINNET_FORK === 'true',
    USE_SDK_MOCK: process.env.REACT_APP_USE_SDK_MOCK === 'true',
    ALLOW_DEV_MODE: process.env.REACT_APP_ALLOW_DEV_MODE === 'true',
    INFURA_PROJECT_ID: process.env.REACT_APP_INFURA_PROJECT_ID,
    ETHERSCAN_API_KEY: process.env.REACT_APP_ETHERSCAN_API_KEY,
    ALCHEMY_API_KEY: process.env.REACT_APP_ALCHEMY_API_KEY,
    BLOCKNATIVE_KEY: process.env.REACT_APP_BLOCKNATIVE_KEY,
    FORTMATIC_KEY: process.env.REACT_APP_FORTMATIC_KEY,
    PORTIS_KEY: process.env.REACT_APP_PORTIS_KEY,
    ZAPPER_API_KEY: process.env.REACT_APP_ZAPPER_API_KEY,
  })
);
