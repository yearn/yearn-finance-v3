import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';

import { Network } from './Blockchain';

export type ProviderType = 'custom' | 'wallet' | 'ethereum' | 'fantom';

export interface Web3Provider {
  providerType: ProviderType;
  changeProviderType: (network: Network) => void;
  getInstanceOf: (type: ProviderType) => JsonRpcProvider;
  register: (type: ProviderType, instance: JsonRpcProvider) => void;
  getSigner: () => JsonRpcSigner;
}
