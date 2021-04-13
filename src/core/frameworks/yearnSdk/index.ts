import { Yearn } from '@yfi/sdk';

import { Web3Provider, Config } from '@types';

export const getYearnSdk = ({ web3Provider, config }: { web3Provider: Web3Provider; config: Config }) => {
  const { USE_MAINNET_FORK, CONTRACT_ADDRESSES } = config;
  const provider = web3Provider.getInstanceOf(USE_MAINNET_FORK ? 'local' : 'default');
  const addresses = USE_MAINNET_FORK
    ? {
        oracle: CONTRACT_ADDRESSES.oracle,
        lens: CONTRACT_ADDRESSES.lens,
        registryV2Adapter: CONTRACT_ADDRESSES.registryV2Adapter,
      }
    : undefined;
  return new Yearn(1, {
    provider,
    addresses,
  });
};
