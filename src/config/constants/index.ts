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
      CONTRACT_ADDRESSES_LOCAL: {
        oracle: '0xd3ca98D986Be88b72Ff95fc2eC976a5E6339150d',
        lens: '0xE7eD6747FaC5360f88a2EFC03E00d25789F69291',
        registryV2Adapter: '0xE7eD6747FaC5360f88a2EFC03E00d25789F69291',
      },
      CONTRACT_ADDRESSES_MAINNET: {
        oracle: '0x83d95e0D5f402511dB06817Aff3f9eA88224B030',
        lens: '0xE7eD6747FaC5360f88a2EFC03E00d25789F69291',
        registryV2Adapter: '0xE75E51566C5761896528B4698a88C92A54B3C954',
      },
    };
  }
);
