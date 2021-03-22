import { memoize } from 'lodash';

import { Env, EthereumNetwork } from '@types';

export const getEnv = memoize(
  (): Env => ({
    ENV: process.env.NODE_ENV,
    ETHEREUM_NETWORK: (process.env.NEXT_PUBLIC_ETHEREUM_NETWORK ||
      'mainnet') as EthereumNetwork,
    INFURA_PROJECT_ID: process.env.INFURA_PROJECT_ID,
    ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY,
    ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
    BLOCKNATIVE_KEY: process.env.BLOCKNATIVE_KEY,
    FORTMATIC_KEY: process.env.FORTMATIC_KEY,
    PORTIS_KEY: process.env.PORTIS_KEY,
  })
);
