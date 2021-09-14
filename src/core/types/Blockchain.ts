export type Network = 'mainnet' | 'morden' | 'ropsten' | 'rinkeby' | 'kovan' | 'fantom';

export type Symbol = string;

export type Address = string;

export type Wei = string;

export type RpcUrl = string;

export interface GasFees {
  gasPrice?: Wei;
  maxFeePerGas?: Wei;
  maxPriorityFeePerGas?: Wei;
}
