import { memoize } from 'lodash';

import { Constants } from '@types';
import { getEnv } from '@config/env';

export const getConstants = memoize(
  (): Constants => {
    const { ALCHEMY_API_KEY } = getEnv();
    return {
      ETHEREUM_ADDRESS: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      MAX_UINT256: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
      WEB3_PROVIDER_HTTPS: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      WEB3_PROVIDER_WSS: `wss://eth-mainnet.ws.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      FANTOM_PROVIDER_HTTPS: 'https://rpcapi.fantom.network',
      LOCAL_PROVIDER_HTTPS: 'http://127.0.0.1:8545/',
      CONTRACT_ADDRESSES: {
        oracle: '0xd3ca98d986be88b72ff95fc2ec976a5e6339150d',
        lens: '0xb6286fAFd0451320ad6A8143089b216C2152c025',
        registryV2Adapter: '0xe0aA552A10d7EC8760Fc6c246D391E698a82dDf9',
      },
    };
  }
);
