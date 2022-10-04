export type Network = 'mainnet' | 'ropsten' | 'rinkeby' | 'kovan' | 'arbitrum' | 'other' | 'goerli';

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

// based off our standard event data in subgraph
export interface Event {
  type: string;
  address: Address;
  block: number;
  timestamp: string;
}
