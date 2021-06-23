import { memoize } from 'lodash';

import { Constants } from '@types';
import { getEnv } from '@config/env';

const ADDRESSES = {
  ETH: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  CRV: '0xD533a949740bb3306d119CC777fa900bA034cd52',
  VECRV: '0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2',
  YVECRV: '0xc5bDdf9843308380375a611c18B50Fb9341f502A',
  THREECRV: '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
  YVBOOST: '0x9d409a0A012CFbA9B15F6D4B36Ac57A46966Ab9a',
};

export const getConstants = memoize(
  (): Constants => {
    const { ALCHEMY_API_KEY } = getEnv();
    return {
      ETHEREUM_ADDRESS: ADDRESSES.ETH,
      MAX_UINT256: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
      YEARN_API: 'https://api.yearn.finance/v1/chains/1/vaults/all',
      WEB3_PROVIDER_HTTPS: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      WEB3_PROVIDER_WSS: `wss://eth-mainnet.ws.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      FANTOM_PROVIDER_HTTPS: 'https://rpcapi.fantom.network',
      LOCAL_PROVIDER_HTTPS: 'http://127.0.0.1:8545/',
      CONTRACT_ADDRESSES: {
        oracle: '0xE7eD6747FaC5360f88a2EFC03E00d25789F69291',
        lens: '0xFbD588c72B438faD4Cf7cD879c8F730Faa213Da0',
        registryV2Adapter: '0xFbD588c72B438faD4Cf7cD879c8F730Faa213Da0',
        helper: '0x420b1099B9eF5baba6D92029594eF45E19A04A4A',
        zapIn: '0x92Be6ADB6a12Da0CA607F9d87DB2F9978cD6ec3E',
        zapOut: '0xA8a3B1A1e09A0f84B2856533DB4eE0Cc88DD4E11',
        ...ADDRESSES,
      },
      SLIPPAGE_OPTIONS: [0.01, 0.02, 0.03],
      DEFAULT_SLIPPAGE: 0.01,
      ZAP_OUT_TOKENS: [ADDRESSES.ETH, ADDRESSES.DAI, ADDRESSES.USDC, ADDRESSES.USDT, ADDRESSES.WBTC],
      DEFAULT_THEME: 'light',
      AVAILABLE_THEMES: ['light', 'dark', 'cyberpunk'],
    };
  }
);
