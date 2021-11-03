import { ethers } from 'ethers';

import { Network, RpcUrl } from '@types';

import { EthersWeb3ProviderImpl } from './Web3Provider';

export const getEthersDefaultProvider = (
  network: Network | RpcUrl,
  infuraProjectId?: string,
  etherscanApiKey?: string,
  alchemyApiKey?: string
) => {
  const options = {
    ...(infuraProjectId && { infura: infuraProjectId }),
    ...(etherscanApiKey && { etherscan: etherscanApiKey }),
    ...(alchemyApiKey && { alchemy: alchemyApiKey }),
  };
  return ethers.getDefaultProvider(network, options);
};

export const getJsonRpcProvider = (url: RpcUrl) => {
  return new ethers.providers.JsonRpcProvider({ url, timeout: 500000 });
};

export const getEthersProvider = (provider: ethers.providers.ExternalProvider) => {
  return new ethers.providers.Web3Provider(provider);
};

export const signMessage = (provider: ethers.providers.ExternalProvider, message: string) => {
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

export const getUncheckedSigner = (provider: ethers.providers.ExternalProvider) => {
  return getEthersProvider(provider).getUncheckedSigner();
};

export const { formatEther, formatUnits, parseEther, parseUnits } = ethers.utils;

export type ExternalProvider = ethers.providers.ExternalProvider;

export const { BigNumber } = ethers;

export { EthersWeb3ProviderImpl };
