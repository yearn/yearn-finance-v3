export type Network = 'mainnet' | 'morden' | 'ropsten' | 'rinkeby' | 'kovan' | 'fantom' | 'arbitrum' | 'other';

export type Symbol = string;

export type Address = string;

export type Wei = string;

export type Unit = string;

export type RpcUrl = string;

export interface GasFees {
  gasPrice?: Wei;
  maxFeePerGas?: Wei;
  maxPriorityFeePerGas?: Wei;
}
