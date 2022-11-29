import { getConfig } from '@config';
import { Network, ProviderType } from '@types';

export const getNetworkId = (network: Network): number => {
  switch (network) {
    case 'mainnet':
      return 1;
    case 'morden':
      return 2;
    case 'ropsten':
      return 3;
    case 'rinkeby':
      return 4;
    case 'kovan':
      return 42;
    case 'optimism':
      return 10;
    case 'fantom':
      return 250;
    case 'arbitrum':
      return 42161;
    default:
      return 0;
  }
};

export const getNetwork = (networkId: number | string): Network => {
  switch (networkId.toString()) {
    case '1':
      return 'mainnet';
    case '2':
      return 'morden';
    case '3':
      return 'ropsten';
    case '4':
      return 'rinkeby';
    case '42':
      return 'kovan';
    case '10':
      return 'optimism';
    case '250':
      return 'fantom';
    case '42161':
      return 'arbitrum';
    default:
      console.warn(`Unknown networkId: ${networkId} (as ${typeof networkId})`);
      return 'other';
  }
};

export const getNetworkRpc = (network: Network): string => {
  const { RPC_URL } = getConfig();
  return RPC_URL[network];
};

export const getProviderType = (network: Network): ProviderType => {
  switch (network) {
    case 'mainnet':
      return 'ethereum';
    case 'fantom':
      return 'fantom';
    case 'arbitrum':
      return 'arbitrum';
    case 'optimism':
      return 'optimism';
    default:
      throw Error('Unknown Network');
  }
};
