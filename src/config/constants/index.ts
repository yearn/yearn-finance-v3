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
        oracle: '0xE7eD6747FaC5360f88a2EFC03E00d25789F69291',
        lens: '0xFbD588c72B438faD4Cf7cD879c8F730Faa213Da0',
        registryV2Adapter: '0xFbD588c72B438faD4Cf7cD879c8F730Faa213Da0',
        helper: '0x420b1099B9eF5baba6D92029594eF45E19A04A4A',
      },
      SLIPPAGE_OPTIONS: [0.01, 0.02, 0.03],
      DEFAULT_SLIPPAGE: 0.01,
    };
  }
);
