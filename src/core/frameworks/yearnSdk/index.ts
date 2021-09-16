import { Yearn } from '@yfi/sdk';

import { Web3Provider, Config } from '@types';
import { yearnSdkMock } from './yearnSdkMock';

export const getYearnSdk = ({ web3Provider, config }: { web3Provider: Web3Provider; config: Config }) => {
  const { USE_SDK_MOCK } = config;

  if (USE_SDK_MOCK) {
    return yearnSdkMock;
  }

  // TODO: Change networkId dynamically on SDK
  return new Yearn(250, {
    provider: web3Provider.getInstanceOf(web3Provider.providerType),
    cache: {
      useCache: false,
    },
  });
};
