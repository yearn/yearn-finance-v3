import { VaultData } from '@types';

export interface Service<T1, T2> {
  execute(props?: T1): T2 | Promise<T2>;
}

export interface GetSupportedVaultsService extends Service<void, VaultData[]> {}
