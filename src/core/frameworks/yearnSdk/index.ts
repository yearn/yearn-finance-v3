import { Yearn } from '@yfi/sdk';

import { Web3Provider, Config } from '@types';

export const getYearnSdk = ({ web3Provider, config }: { web3Provider: Web3Provider; config: Config }) => {
  //   const { CONTRACT_ADDRESSES } = config;
  // const provider = web3Provider.getInstanceOf('local');
  const provider = web3Provider.getInstanceOf('default');
  return new Yearn(1, {
    provider,
    // addresses: {
    //   oracle: CONTRACT_ADDRESSES.oracle,
    //   lens: CONTRACT_ADDRESSES.lens,
    //   registryV2Adapter: CONTRACT_ADDRESSES.registryV2Adapter,
    // },
  });
};
