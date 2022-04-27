import { memoize } from 'lodash';

import { Env, Network } from '@types';

export const getEnv = memoize(
  (): Env => ({
    ENV: import.meta.env.NODE_ENV,
    VERSION: import.meta.env.VITE_VERSION ?? 'unknown',
    NETWORK: (import.meta.env.VITE_NETWORK ?? 'mainnet') as Network,
    CUSTOM_PROVIDER_HTTPS: import.meta.env.VITE_CUSTOM_PROVIDER_HTTPS ?? 'http://127.0.0.1:8545/',
    USE_MAINNET_FORK: import.meta.env.VITE_USE_MAINNET_FORK === 'true',
    USE_SDK_MOCK: import.meta.env.VITE_USE_SDK_MOCK === 'true',
    ALLOW_DEV_MODE: import.meta.env.VITE_ALLOW_DEV_MODE === 'true',
    INFURA_PROJECT_ID: import.meta.env.VITE_INFURA_PROJECT_ID,
    ETHERSCAN_API_KEY: import.meta.env.VITE_ETHERSCAN_API_KEY,
    ALCHEMY_API_KEY: import.meta.env.VITE_ALCHEMY_API_KEY,
    BLOCKNATIVE_KEY: import.meta.env.VITE_BLOCKNATIVE_KEY,
    FORTMATIC_KEY: import.meta.env.VITE_FORTMATIC_KEY,
    PORTIS_KEY: import.meta.env.VITE_PORTIS_KEY,
    ZAPPER_API_KEY: import.meta.env.VITE_ZAPPER_API_KEY,
    YEARN_SUBGRAPH_KEY: import.meta.env.VITE_YEARN_SUBGRAPH_KEY,
  })
);
