import { EthereumNetwork, EthereumAddress, Wei } from './Ethereum';
import { Theme } from '@types';

export interface Config extends Env, Constants {}

export interface Env {
  ENV: string;
  ETHEREUM_NETWORK: EthereumNetwork;
  USE_MAINNET_FORK: boolean;
  USE_SDK_MOCK: boolean;
  ALLOW_DEV_MODE: boolean;
  INFURA_PROJECT_ID: string | undefined;
  ETHERSCAN_API_KEY: string | undefined;
  ALCHEMY_API_KEY: string | undefined;
  BLOCKNATIVE_KEY: string | undefined;
  FORTMATIC_KEY: string | undefined;
  PORTIS_KEY: string | undefined;
}

export interface Constants {
  STATE_VERSION: number;
  ETHEREUM_ADDRESS: EthereumAddress;
  MAX_UINT256: Wei;
  YEARN_API: string;
  WEB3_PROVIDER_HTTPS: string;
  WEB3_PROVIDER_WSS: string;
  FANTOM_PROVIDER_HTTPS: string;
  LOCAL_PROVIDER_HTTPS: string;
  CONTRACT_ADDRESSES: {
    [KEY: string]: string;
  };
  SLIPPAGE_OPTIONS: number[];
  DEFAULT_SLIPPAGE: number;
  ZAP_OUT_TOKENS: string[];
  DEFAULT_THEME: Theme;
  AVAILABLE_THEMES: Theme[];
}
