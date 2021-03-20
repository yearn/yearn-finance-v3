import { memoize } from 'lodash';

import { Env, EthereumNetwork } from '@types';

export const getEnv = memoize(
  (): Env => ({
    ENV: process.env.NODE_ENV,
    ETHEREUM_NETWORK: (process.env.NEXT_PUBLIC_ETHEREUM_NETWORK ||
      'mainnet') as EthereumNetwork,
  })
);
