import { Provider, JsonRpcSigner, Web3Provider } from '@ethersproject/providers';

import { getConfig } from '@config';
import { ProviderType, Web3Provider as AppWeb3Provider } from '@types';
import { getEthersDefaultProvider } from './';

export class EthersWeb3ProviderImpl implements AppWeb3Provider {
  private instances: Map<ProviderType, Provider> = new Map<ProviderType, Provider>();

  constructor() {
    const { FANTOM_PROVIDER_HTTPS, WEB3_PROVIDER_HTTPS, LOCAL_PROVIDER_HTTPS } = getConfig();
    this.register('default', getEthersDefaultProvider(WEB3_PROVIDER_HTTPS));
    this.register('fantom', getEthersDefaultProvider(FANTOM_PROVIDER_HTTPS));
    this.register('local', getEthersDefaultProvider(LOCAL_PROVIDER_HTTPS));
  }

  public getInstanceOf(type: ProviderType): Provider {
    const instance = this.instances.get(type);

    if (!instance) {
      throw new Error(`EthersWeb3ProviderImpl has no "${type}" provider registered`);
    }

    return instance;
  }

  public register(type: ProviderType, instance: Provider): void {
    this.instances.set(type, instance);
  }

  public getSigner(): JsonRpcSigner {
    const provider = this.getInstanceOf('wallet') as Web3Provider;
    return provider.getSigner();
  }
}
