import { JsonRpcProvider, JsonRpcSigner, Web3Provider } from '@ethersproject/providers';

import { getConfig } from '@config';
import { ProviderType, Web3Provider as AppWeb3Provider } from '@types';
import { getJsonRpcProvider } from './';

export class EthersWeb3ProviderImpl implements AppWeb3Provider {
  private instances: Map<ProviderType, JsonRpcProvider> = new Map<ProviderType, JsonRpcProvider>();

  constructor() {
    const { FANTOM_PROVIDER_HTTPS, WEB3_PROVIDER_HTTPS, CUSTOM_PROVIDER_HTTPS } = getConfig();
    this.register('default', getJsonRpcProvider(WEB3_PROVIDER_HTTPS));
    this.register('fantom', getJsonRpcProvider(FANTOM_PROVIDER_HTTPS));
    this.register('custom', getJsonRpcProvider(CUSTOM_PROVIDER_HTTPS));
  }

  public getInstanceOf(type: ProviderType): JsonRpcProvider {
    const instance = this.instances.get(type);

    if (!instance) {
      throw new Error(`EthersWeb3ProviderImpl has no "${type}" provider registered`);
    }

    return instance;
  }

  public register(type: ProviderType, instance: JsonRpcProvider): void {
    this.instances.set(type, instance);
  }

  public getSigner(): JsonRpcSigner {
    const provider = this.getInstanceOf('wallet') as Web3Provider;
    return provider.getSigner();
  }
}
