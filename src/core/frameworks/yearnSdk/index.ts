import { Yearn } from '@yfi/sdk';

import { getNetworkId, getProviderType } from '@utils';
import { YearnSdk, SdkNetwork, Web3Provider, Network, Config } from '@types';

export class YearnSdkImpl implements YearnSdk {
  private instances: Map<Network, Yearn<SdkNetwork>> = new Map<Network, Yearn<SdkNetwork>>();

  constructor({ web3Provider, config }: { web3Provider: Web3Provider; config: Config }) {
    const { SUPPORTED_NETWORKS, CONTRACT_ADDRESSES, YEARN_SUBGRAPH_ID, YEARN_SUBGRAPH_KEY } = config;

    SUPPORTED_NETWORKS.forEach((network) => {
      const providerType = getProviderType(network);
      const provider = web3Provider.getInstanceOf(providerType);
      const networkId = getNetworkId(network) as SdkNetwork;
      const sdkInstance = new Yearn(networkId, {
        provider,
        partnerId: networkId === 1 ? CONTRACT_ADDRESSES.LEDGER_PARTNER_ID : undefined,
        ...(YEARN_SUBGRAPH_KEY && {
          subgraph: {
            mainnetSubgraphEndpoint: `https://gateway.thegraph.com/api/${YEARN_SUBGRAPH_KEY}/subgraphs/id/${YEARN_SUBGRAPH_ID}`,
          },
        }),
      });
      this.register(network, sdkInstance);
    });
  }

  public hasInstanceOf(network: Network): boolean {
    return this.instances.has(network);
  }

  public getInstanceOf(network: Network): Yearn<SdkNetwork> {
    const instance = this.instances.get(network);

    if (!instance) {
      throw new Error(`YearnSdkImpl has no "${network}" network registered`);
    }

    return instance;
  }

  public register(network: Network, instance: Yearn<SdkNetwork>): void {
    this.instances.set(network, instance);
  }
}
