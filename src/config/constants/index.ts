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
    };
  }
);
