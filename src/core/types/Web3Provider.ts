import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';

export type ProviderType = 'default' | 'wallet' | 'fantom' | 'custom';

export interface Web3Provider {
  providerType: ProviderType;
  getInstanceOf: (type: ProviderType) => JsonRpcProvider;
  register: (type: ProviderType, instance: JsonRpcProvider) => void;
  getSigner: () => JsonRpcSigner;
}
