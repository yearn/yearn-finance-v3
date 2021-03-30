import { Provider } from '@ethersproject/abstract-provider';
import { providers } from 'ethers';

import { getConfig } from '@config';
import { ProviderType, Web3Provider } from '@types';
import { getEthersDefaultProvider } from './';

export class EthersWeb3ProviderImpl implements Web3Provider {
  private instances: Map<ProviderType, Provider> = new Map<ProviderType, Provider>();

  constructor() {
    const { FANTOM_PROVIDER_HTTPS, ETHEREUM_NETWORK, ALCHEMY_API_KEY } = getConfig();
    this.register('default', getEthersDefaultProvider(ETHEREUM_NETWORK, undefined, undefined, ALCHEMY_API_KEY));
    this.register('fantom', getEthersDefaultProvider(FANTOM_PROVIDER_HTTPS));
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

  public getSigner(): providers.JsonRpcSigner {
    const provider = this.getInstanceOf('wallet') as providers.Web3Provider;
    return provider.getSigner();
  }
}
