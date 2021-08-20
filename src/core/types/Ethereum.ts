export type EthereumNetwork = 'mainnet' | 'morden' | 'ropsten' | 'rinkeby' | 'kovan';

export type Symbol = string;

export type EthereumAddress = string;

export type Wei = string;

export type RpcUrl = string;

export interface GasFees {
  gasPrice: Wei;
  maxFeePerGas: Wei;
  maxPriorityFeePerGas: Wei;
}
