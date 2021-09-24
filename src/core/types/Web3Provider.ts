import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';

export type ProviderType = 'custom' | 'wallet' | 'ethereum' | 'fantom';

export interface Web3Provider {
  hasInstanceOf: (type: ProviderType) => boolean;
  getInstanceOf: (type: ProviderType) => JsonRpcProvider;
  register: (type: ProviderType, instance: JsonRpcProvider) => void;
  getSigner: () => JsonRpcSigner;
}
