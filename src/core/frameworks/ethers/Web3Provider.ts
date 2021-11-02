import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';

import { getConfig } from '@config';
import { getProviderType, getNetworkRpc } from '@utils';
import { ProviderType, Web3Provider as AppWeb3Provider } from '@types';

import { getJsonRpcProvider } from './';

export class EthersWeb3ProviderImpl implements AppWeb3Provider {
  private instances: Map<ProviderType, JsonRpcProvider> = new Map<ProviderType, JsonRpcProvider>();

  constructor() {
    const { SUPPORTED_NETWORKS, CUSTOM_PROVIDER_HTTPS, USE_MAINNET_FORK } = getConfig();
    SUPPORTED_NETWORKS.forEach((network) => {
      const rpcUrl = getNetworkRpc(network);
      const provider = getJsonRpcProvider(rpcUrl);
      const providerType = getProviderType(network);
      this.register(providerType, provider);
    });
    if (USE_MAINNET_FORK) this.register('custom', getJsonRpcProvider(CUSTOM_PROVIDER_HTTPS));
  }

  public hasInstanceOf(type: ProviderType): boolean {
    return this.instances.has(type);
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
    const provider = this.getInstanceOf('wallet');
    return provider.getSigner();
  }
}
