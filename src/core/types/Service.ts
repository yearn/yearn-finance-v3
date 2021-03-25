import { EthereumAddress } from '@types';

export interface Service<T1, T2> {
  execute(props?: T1): T2 | Promise<T2>;
}

export interface GetSupportedVaultsServiceResult {
  vaultAddress: EthereumAddress;
  tokenAddress: EthereumAddress;
}

export interface GetSupportedVaultsService
  extends Service<void, GetSupportedVaultsServiceResult[]> {}
