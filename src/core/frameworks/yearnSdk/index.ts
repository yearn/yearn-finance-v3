import { Yearn } from '@yfi/sdk';

import { Web3Provider, Config } from '@types';
import { yearnSdkMock } from './yearnSdkMock';

export const getYearnSdk = ({ web3Provider, config }: { web3Provider: Web3Provider; config: Config }) => {
  const { USE_MAINNET_FORK, CONTRACT_ADDRESSES, USE_SDK_MOCK } = config;

  if (USE_SDK_MOCK) {
    return yearnSdkMock;
  }

  if (USE_MAINNET_FORK) {
    return new Yearn(
      1337,
      {
        provider: web3Provider.getInstanceOf('local'),
        addresses: {
          oracle: CONTRACT_ADDRESSES.oracle,
          lens: CONTRACT_ADDRESSES.lens,
          registryV2Adapter: CONTRACT_ADDRESSES.registryV2Adapter,
        },
      },
      {
        get: (key) => localStorage.getItem(key) ?? undefined,
        set: (key, value) => localStorage.setItem(key, value),
      }
    );
  } else {
    return new Yearn(1, {
      provider: web3Provider.getInstanceOf('default'),
    });
  }
};
