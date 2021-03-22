import { ethers } from 'ethers';

import { EthereumNetwork } from '@types';

const toEthersNetwork = (network: EthereumNetwork): string => {
  switch (network) {
    case 'mainnet':
      return 'homestead';
    default:
      return network;
  }
};

export const getEthersDefaultProvider = (
  network: EthereumNetwork,
  infuraProjectId?: string,
  etherscanApiKey?: string,
  alchemyApiKey?: string
) => {
  const options = {
    ...(infuraProjectId && { infura: infuraProjectId }),
    ...(etherscanApiKey && { etherscan: etherscanApiKey }),
    ...(alchemyApiKey && { alchemy: alchemyApiKey }),
  };
  return ethers.getDefaultProvider(toEthersNetwork(network), options);
};

export const getEthersProvider = (
  provider: ethers.providers.ExternalProvider
) => {
  return new ethers.providers.Web3Provider(provider);
};

export const signMessage = (
  provider: ethers.providers.ExternalProvider,
  message: string
) => {
  return getEthersProvider(provider).getSigner().signMessage(message);
};

export const getContract = (
  address: string,
  contractABI: ethers.ContractInterface,
  provider: ethers.providers.Provider | ethers.Signer
) => {
  return new ethers.Contract(address, contractABI, provider);
};

export const getSigner = (provider: ethers.providers.ExternalProvider) => {
  return getEthersProvider(provider).getSigner();
};

export const getUncheckedSigner = (
  provider: ethers.providers.ExternalProvider
) => {
  return getEthersProvider(provider).getUncheckedSigner();
};

export const {
  formatEther,
  formatUnits,
  parseEther,
  parseUnits,
} = ethers.utils;

export const { BigNumber } = ethers;
