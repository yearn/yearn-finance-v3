import { providers } from 'ethers';

export type ProviderType = 'default' | 'wallet' | 'fantom' | 'local';

export interface Web3Provider {
  getInstanceOf: (type: ProviderType) => providers.Provider;
  register: (type: ProviderType, instance: providers.Provider) => void;
  getSigner: () => providers.JsonRpcSigner;
}
