import { JsonRpcProvider } from '@ethersproject/providers';
import { Yearn } from '@yfi/sdk';
import { Web3Provider, Config } from '@types';
import { yearnSdkMock } from './yearnSdkMock';

export const getYearnSdk = ({ web3Provider, config }: { web3Provider: Web3Provider; config: Config }) => {
  const { USE_MAINNET_FORK, CONTRACT_ADDRESSES_LOCAL, CONTRACT_ADDRESSES_MAINNET, USE_SDK_MOCK } = config;

  console.log('USE_SDK_MOCK', USE_SDK_MOCK);
  console.log('REACT_APP_USE_SDK_MOCK', process.env.REACT_APP_USE_SDK_MOCK);

  if (USE_SDK_MOCK) {
    return yearnSdkMock;
  }

  if (USE_MAINNET_FORK) {
    return new Yearn(
      1337,
      {
        provider: web3Provider.getInstanceOf('local'),
        addresses: {
          oracle: CONTRACT_ADDRESSES_LOCAL.oracle,
          lens: CONTRACT_ADDRESSES_LOCAL.lens,
          registryV2Adapter: CONTRACT_ADDRESSES_LOCAL.registryV2Adapter,
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
      addresses: {
        oracle: CONTRACT_ADDRESSES_MAINNET.oracle,
        lens: CONTRACT_ADDRESSES_MAINNET.lens,
        registryV2Adapter: CONTRACT_ADDRESSES_MAINNET.registryV2Adapter,
      },
    });
  }
};
