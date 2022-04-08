import { Network, Address, Wei } from './Blockchain';
import { NetworkSettings, Theme, Language } from './Settings';

export interface Config extends Env, Constants {}

export interface Env {
  ENV: string;
  VERSION: string;
  NETWORK: Network;
  CUSTOM_PROVIDER_HTTPS: string;
  USE_MAINNET_FORK: boolean;
  USE_SDK_MOCK: boolean;
  ALLOW_DEV_MODE: boolean;
  INFURA_PROJECT_ID: string | undefined;
  ETHERSCAN_API_KEY: string | undefined;
  ALCHEMY_API_KEY: string | undefined;
  BLOCKNATIVE_KEY: string | undefined;
  FORTMATIC_KEY: string | undefined;
  PORTIS_KEY: string | undefined;
  ZAPPER_API_KEY: string | undefined;
}

export interface Constants {
  STATE_VERSION: number;
  ETHEREUM_ADDRESS: Address;
  MAX_UINT256: Wei;
  YEARN_API: string;
  YEARN_ALERTS_API: string;
  SUPPORTED_NETWORKS: Network[];
  NETWORK_SETTINGS: NetworkSettings;
  WEB3_PROVIDER_HTTPS: string;
  WEB3_PROVIDER_WSS: string;
  FANTOM_PROVIDER_HTTPS: string;
  ARBITRUM_PROVIDER_HTTPS: string;
  CONTRACT_ADDRESSES: {
    [KEY: string]: string;
  };
  SLIPPAGE_OPTIONS: number[];
  DEFAULT_SLIPPAGE: number;
  IRON_BANK_MAX_RATIO: number;
  ZAP_OUT_TOKENS: string[];
  DEFAULT_THEME: Theme;
  AVAILABLE_THEMES: Theme[];
  AVAILABLE_CUSTOM_THEMES: Theme[];
  DEFAULT_ALERT_TIMEOUT: number;
  DEFAULT_LANG: Language;
  SUPPORTED_LANGS: Language[];
  DUST_AMOUNT_USD: string;
}
