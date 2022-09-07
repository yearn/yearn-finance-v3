import { ethers } from 'ethers';
import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer';

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

const _signTypedData = async (
  signer: ethers.providers.JsonRpcSigner,
  domain: TypedDataDomain,
  types: Record<string, TypedDataField[]>,
  value: Record<string, any>
): Promise<string> => {
  const typedData = JSON.stringify({
    types: {
      EIP712Domain: [
        {
          name: 'name',
          type: 'string',
        },
        {
          name: 'version',
          type: 'string',
        },
        {
          name: 'chainId',
          type: 'uint256',
        },
        {
          name: 'verifyingContract',
          type: 'address',
        },
      ],
      ...types,
    },
    primaryType: 'Permit',
    domain,
    message: value,
  });

  const address = await signer.getAddress();
  const signature = await signer.provider.send('eth_signTypedData_v4', [address, typedData]);
  return signature;
};

export const signTypedData = async (
  signer: ethers.providers.JsonRpcSigner,
  domain: TypedDataDomain,
  types: Record<string, TypedDataField[]>,
  value: Record<string, any>
) => {
  // NOTE: Use Ethers signTypedData once it gets a stable release
  // const signature = await signer._signTypedData(domain, types, value);
  const signature = await _signTypedData(signer, domain, types, value);

  // NOTE: Invalid Ledger + Metamask signatures need to be reconstructed until issue is solved and released
  // https://github.com/MetaMask/eth-ledger-bridge-keyring/pull/152
  // https://github.com/MetaMask/metamask-extension/issues/10240
  const isInvalidLedgerSignature = signature.endsWith('00') || signature.endsWith('01');

  if (!isInvalidLedgerSignature) return signature;

  const { r, s, v, recoveryParam } = ethers.utils.splitSignature(signature);
  return ethers.utils.joinSignature({ r, s, v, recoveryParam });
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
