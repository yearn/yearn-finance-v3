import { EthereumNetwork, EthereumAddress, Wei } from './Ethereum';

export interface Config extends Env, Constants {}

export interface Env {
  ENV: string;
  ETHEREUM_NETWORK: EthereumNetwork;
}

export interface Constants {
  ETHEREUM_ADDRESS: EthereumAddress;
  MAX_UINT256: Wei;
}
