import { memoize } from 'lodash';

import { Env, EthereumNetwork } from '@types';

export const getEnv = memoize(
  (): Env => ({
    ENV: process.env.NODE_ENV,
    ETHEREUM_NETWORK: (process.env.REACT_APP_ETHEREUM_NETWORK || 'mainnet') as EthereumNetwork,
    INFURA_PROJECT_ID: process.env.REACT_APP_INFURA_PROJECT_ID,
    ETHERSCAN_API_KEY: process.env.REACT_APP_ETHERSCAN_API_KEY,
    ALCHEMY_API_KEY: process.env.REACT_APP_ALCHEMY_API_KEY,
    BLOCKNATIVE_KEY: process.env.REACT_APP_BLOCKNATIVE_KEY,
    FORTMATIC_KEY: process.env.REACT_APP_FORTMATIC_KEY,
    PORTIS_KEY: process.env.REACT_APP_PORTIS_KEY,
  })
);
