import { EthereumNetwork, EthereumAddress, Wei } from './Ethereum';

export interface Config extends Env, Constants {}

export interface Env {
  ENV: string;
  ETHEREUM_NETWORK: EthereumNetwork;
  INFURA_PROJECT_ID: string | undefined;
  ETHERSCAN_API_KEY: string | undefined;
  ALCHEMY_API_KEY: string | undefined;
  BLOCKNATIVE_KEY: string | undefined;
  FORTMATIC_KEY: string | undefined;
  PORTIS_KEY: string | undefined;
}

export interface Constants {
  ETHEREUM_ADDRESS: EthereumAddress;
  MAX_UINT256: Wei;
  WEB3_PROVIDER_HTTPS: string;
  WEB3_PROVIDER_WSS: string;
  FANTOM_PROVIDER_HTTPS: string;
}
