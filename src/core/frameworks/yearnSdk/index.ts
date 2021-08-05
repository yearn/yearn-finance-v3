import { Yearn } from '@yfi/sdk';

import { Web3Provider, Config } from '@types';
import { yearnSdkMock } from './yearnSdkMock';

export const getYearnSdk = ({ web3Provider, config }: { web3Provider: Web3Provider; config: Config }) => {
  const { USE_SDK_MOCK } = config;

  if (USE_SDK_MOCK) {
    return yearnSdkMock;
  }

  return new Yearn(1, {
    provider: web3Provider.getInstanceOf(web3Provider.providerType),
  });
};
