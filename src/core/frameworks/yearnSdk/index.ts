import { Yearn } from '@yfi/sdk';

import { getNetworkId, getProviderType } from '@utils';
import { YearnSdk, SdkNetwork, Web3Provider, Network, Config } from '@types';

export class YearnSdkImpl implements YearnSdk {
  private instance: Yearn<SdkNetwork> | null;
  private SUPPORTED_NETWORKS: Network[];
  private web3Provider: Web3Provider;
  private currentNetwork: Network | null;

  constructor({ web3Provider, config }: { web3Provider: Web3Provider; config: Config }) {
    const { SUPPORTED_NETWORKS } = config;

    this.web3Provider = web3Provider;
    this.SUPPORTED_NETWORKS = SUPPORTED_NETWORKS;
    this.currentNetwork = null;
    this.instance = null;
  }

  public hasInstanceOf(network: Network) {
    return network === this.currentNetwork || !this.instance;
  }

  public getInstanceOf(network: Network): Yearn<SdkNetwork> {
    const instance = this.instance;

    if (!instance || network !== this.currentNetwork) {
      if (this.SUPPORTED_NETWORKS.includes(network)) {
        this.currentNetwork = network;
        const providerType = getProviderType(network);
        const provider = this.web3Provider.getInstanceOf(providerType);
        const networkId = getNetworkId(network) as SdkNetwork;
        const sdkInstance = new Yearn(networkId, {
          provider,
        });
        this.register(network, sdkInstance);

        return sdkInstance;
      }
      throw new Error(`YearnSdkImpl has no "${network}" network registered`);
    }

    return instance;
  }

  public register(network: Network, instance: Yearn<SdkNetwork>): void {
    this.instance = instance;
    this.currentNetwork = network;
  }
}
