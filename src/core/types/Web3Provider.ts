import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';

export type ProviderType = 'default' | 'wallet' | 'fantom' | 'local';

export interface Web3Provider {
  getInstanceOf: (type: ProviderType) => JsonRpcProvider;
  register: (type: ProviderType, instance: JsonRpcProvider) => void;
  getSigner: () => JsonRpcSigner;
}
