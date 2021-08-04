import { Yearn } from '@yfi/sdk';

import { Web3Provider, Config } from '@types';
import { yearnSdkMock } from './yearnSdkMock';

export const getYearnSdk = ({ web3Provider, config }: { web3Provider: Web3Provider; config: Config }) => {
  const { USE_MAINNET_FORK, USE_SDK_MOCK } = config;

  if (USE_SDK_MOCK) {
    return yearnSdkMock;
  }

  if (USE_MAINNET_FORK) {
    return new Yearn(1, {
      provider: web3Provider.getInstanceOf('custom'),
    });
  } else {
    return new Yearn(1, {
      provider: web3Provider.getInstanceOf('default'),
    });
  }
};
