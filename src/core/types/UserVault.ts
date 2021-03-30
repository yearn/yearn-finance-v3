import { EthereumAddress } from '@types';
import { UserTokenData } from './UserToken';

export interface UserVaultData {
  address: EthereumAddress;
  depositedBalance: string;
  depositedBalanceUsdc: string;
  allowancesMap: { [spenderAddress: string]: string };
  tokenPosition: UserTokenData;
}
