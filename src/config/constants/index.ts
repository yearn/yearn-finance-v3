import { memoize } from 'lodash';

import { Constants, NetworkSettings } from '@types';
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
  YVTHREECRV: '0x84E13785B5a27879921D6F685f041421C7F482dA',
  YVBOOST: '0x9d409a0A012CFbA9B15F6D4B36Ac57A46966Ab9a',
  YUSD: '0x4B5BfD52124784745c1071dcB244C6688d2533d3',
  PSLPYVBOOSTETH: '0xCeD67a187b923F0E5ebcc77C7f2F7da20099e378',
  PSLPYVBOOSTETH_GAUGE: '0xDA481b277dCe305B97F4091bD66595d57CF31634',
  YFI: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
};

const NETWORK_SETTINGS: NetworkSettings = {
  mainnet: {
    id: 'mainnet',
    name: 'Ethereum',
    networkId: 1,
    simulationsEnabled: true,
    zapsEnabled: true,
    labsEnabled: true,
    ironBankEnabled: true,
    earningsEnabled: true,
    notifyEnabled: true,
    blockExplorerUrl: 'https://etherscan.io/address/',
  },
  fantom: {
    id: 'fantom',
    name: 'Fantom',
    networkId: 250,
    simulationsEnabled: false,
    zapsEnabled: false,
    labsEnabled: false,
    ironBankEnabled: true,
    earningsEnabled: false,
    notifyEnabled: false,
    blockExplorerUrl: 'https://ftmscan.com/address/',
  },
};

export const getConstants = memoize((): Constants => {
  const { ALCHEMY_API_KEY } = getEnv();
  return {
    STATE_VERSION: 1,
    ETHEREUM_ADDRESS: ADDRESSES.ETH,
    MAX_UINT256: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    YEARN_API: 'https://api.yearn.finance/v1/chains/1/vaults/all',
    SUPPORTED_NETWORKS: ['mainnet', 'fantom'],
    NETWORK_SETTINGS,
    WEB3_PROVIDER_HTTPS: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
    WEB3_PROVIDER_WSS: `wss://eth-mainnet.ws.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
    FANTOM_PROVIDER_HTTPS: 'https://rpc.ftm.tools',
    CONTRACT_ADDRESSES: {
      zapIn: '0x92Be6ADB6a12Da0CA607F9d87DB2F9978cD6ec3E',
      zapOut: '0xd6b88257e91e4E4D4E990B3A858c849EF2DFdE8c',
      pickleZapIn: '0xc695f73c1862e050059367B2E64489E66c525983',
      y3CrvBackZapper: '0x579422A1C774470cA623329C69f27cC3bEB935a1',
      ironBankComptroller: '0xAB1c342C7bf5Ec5F02ADEA1c2270670bCa144CbB',
      ironBankComptrollerFantom: '0x4250A6D3BD57455d7C6821eECb6206F507576cD2',
      trustedVaultMigrator: '0x1824df8D751704FA10FA371d62A37f9B8772ab90',
      triCryptoVaultMigrator: '0xC306a5ef4B990A7F2b3bC2680E022E6a84D75fC1',
      ...ADDRESSES,
    },
    SLIPPAGE_OPTIONS: [0.01, 0.02, 0.03],
    DEFAULT_SLIPPAGE: 0.01,
    IRON_BANK_MAX_RATIO: 0.8,
    ZAP_OUT_TOKENS: [ADDRESSES.ETH, ADDRESSES.DAI, ADDRESSES.USDC, ADDRESSES.USDT, ADDRESSES.WBTC],
    DEFAULT_THEME: 'light',
    AVAILABLE_THEMES: ['light', 'dark', 'cyberpunk', 'classic'],
    DEFAULT_ALERT_TIMEOUT: 3000,
    DEFAULT_LANG: 'en',
    SUPPORTED_LANGS: ['en', 'de', 'es', 'hi', 'pt', 'tr', 'vi', 'zh'],
    DUST_AMOUNT_USD: '10000000',
  };
});
