import { memoize } from 'lodash';

import { Constants, NetworkSettings } from '@types';
import { getEnv } from '@config/env';
// import { encode } from '@src/utils';

export const TOKEN_ADDRESSES = {
  ETH: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  SUSD: '0x57ab1ec28d129707052df4df418d58a2d46d5f51',
  LUSD: '0x5f98805a4e8be255a32880fdec7f6728c6568ba0',
  ALUSD: '0xbc6da0fe9ad5f3b0d58160288917aa56653660e9',
  RAI: '0x03ab458634910aad20ef5f1c8ee96f1d6ac54919',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
};

const PARTNERS = {
  LEDGER_PARTNER_ID: '0x558247e365be655f9144e1a0140D793984372Ef3',
};

const NETWORK_SETTINGS: NetworkSettings = {
  goerli: {
    id: 'goerli',
    name: 'Goerli Test Network',
    networkId: 5,
    rpcUrl: 'https://goerli.infura.io/v3/',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'GoerliETH',
      decimals: 18,
    },
    simulationsEnabled: true,
    earningsEnabled: true,
    notifyEnabled: true,
    blockExplorerUrl: 'https://goerli.etherscan.io/',
    txConfirmations: 2,
  },
  mainnet: {
    id: 'mainnet',
    name: 'Ethereum',
    networkId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    simulationsEnabled: true,
    earningsEnabled: true,
    notifyEnabled: true,
    blockExplorerUrl: 'https://etherscan.io',
    txConfirmations: 2,
  },
  arbitrum: {
    id: 'arbitrum',
    name: 'Arbitrum',
    networkId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    simulationsEnabled: false,
    earningsEnabled: false,
    notifyEnabled: false,
    blockExplorerUrl: 'https://arbiscan.io',
    txConfirmations: 2,
  },
};

export const getConstants = memoize((): Constants => {
  const { ALCHEMY_API_KEY } = getEnv();
  return {
    STATE_VERSION: 1,
    ETHEREUM_ADDRESS: TOKEN_ADDRESSES.ETH,
    TOKEN_ADDRESSES: TOKEN_ADDRESSES,
    MAX_UINT256: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    DEBT_DAO_API: 'https://api.yearn.finance/v1/chains/1/vaults/all',
    DEBT_DAO_ALERTS_API: 'http://yearn-alerts-balancer-2019386215.us-east-1.elb.amazonaws.com',
    SUPPORTED_NETWORKS: ['mainnet', 'arbitrum'],
    NETWORK_SETTINGS,
    WEB3_PROVIDER_HTTPS: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
    WEB3_PROVIDER_WSS: `wss://eth-mainnet.ws.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
    ARBITRUM_PROVIDER_HTTPS: 'https://arb1.arbitrum.io/rpc',
    CONTRACT_ADDRESSES: {
      zapIn: '0x8E52522E6a77578904ddd7f528A22521DC4154F5',
      zapOut: '0xd6b88257e91e4E4D4E990B3A858c849EF2DFdE8c',
      pickleZapIn: '0xc695f73c1862e050059367B2E64489E66c525983',
      y3CrvBackZapper: '0x579422A1C774470cA623329C69f27cC3bEB935a1',
      trustedVaultMigrator: '0x1824df8D751704FA10FA371d62A37f9B8772ab90',
      triCryptoVaultMigrator: '0xC306a5ef4B990A7F2b3bC2680E022E6a84D75fC1',
      ...TOKEN_ADDRESSES,
      ...PARTNERS,
    },
    MAX_INTEREST_RATE: 20000, // 200% APR
    SLIPPAGE_OPTIONS: [0.01, 0.02, 0.03],
    DEFAULT_SLIPPAGE: 0.01,
    IRON_BANK_MAX_RATIO: 0.8,
    ZAP_OUT_TOKENS: [
      TOKEN_ADDRESSES.ETH,
      TOKEN_ADDRESSES.DAI,
      TOKEN_ADDRESSES.USDC,
      TOKEN_ADDRESSES.USDT,
      TOKEN_ADDRESSES.WBTC,
    ],
    DEFAULT_THEME: 'system-prefs',
    AVAILABLE_THEMES: ['system-prefs', 'light', 'dark', 'cyberpunk', 'classic'],
    AVAILABLE_CUSTOM_THEMES: ['explorer'],
    DEFAULT_ALERT_TIMEOUT: 3000,
    DEFAULT_LANG: 'en',
    SUPPORTED_LANGS: ['en', 'es', 'ja', 'zh'],
    DUST_AMOUNT_USD: '10000000',
    ASSETS_ICON_URL: 'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/multichain-tokens/1/',
    Arbiter_GOERLI: '0xde8f0f6769284e41bf0f82d0545141c15a3e4ad1',
    Oracle_GOERLI: '0x7233038e589913dca4b6d15ff8bba263a433aed2',
    SwapTarget_GOERLI: '0xcb7b9188ada88cb0c991c807acc6b44097059dec',
    LineFactory_GOERLI: '0x43158693dba386562f0581cd48e68df027a5a877',
    SecuredLine_GOERLI: '0x32cD4087c98C09A89Dd5c45965FB13ED64c45456',
    // ZAPPER_AUTH_TOKEN: encode({ str: `${ZAPPER_API_KEY}:`, encoding: 'base64' }),
  };
});
