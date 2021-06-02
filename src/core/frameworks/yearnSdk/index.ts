import { JsonRpcProvider } from '@ethersproject/providers';
import { Web3Provider, Config } from '@types';
import { Yearn } from '@yfi/sdk';
import { yearnSdkMock } from './yearnSdkMock';

type YearnMockSdk = typeof yearnSdkMock;
export const getYearnSdk = ({ web3Provider, config }: { web3Provider: Web3Provider; config: Config }) => {
  const { USE_MAINNET_FORK, CONTRACT_ADDRESSES, USE_SDK_MOCK } = config;
  // return yearnSdkMock;

  // TODO Uncoment this when sdk ready.

  if (USE_SDK_MOCK) {
    return yearnSdkMock;
  }

  if (USE_MAINNET_FORK) {
    return new Yearn(1337, {
      provider: web3Provider.getInstanceOf('local') as JsonRpcProvider, // TODO make it work with writeProviders
      addresses: {
        oracle: CONTRACT_ADDRESSES.oracle,
        helper: CONTRACT_ADDRESSES.helper,
        adapters: {
          registryV2: CONTRACT_ADDRESSES.registryV2Adapter,
        },
      },
    });
  } else {
    return new Yearn(1, {
      provider: web3Provider.getInstanceOf('default') as JsonRpcProvider, // TODO make it work with writeProviders
    });
  }
};
