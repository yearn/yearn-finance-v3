import { VaultData, TokenData, UserVaultData, EthereumAddress } from '@types';

export interface UserService {
  getUserVaultsData: ({ userAddress }: { userAddress: EthereumAddress }) => Promise<UserVaultData[]>;
  // getUserTokensData:
}

export interface VaultService {
  getSupportedVaults: () => Promise<VaultData[]>;
  // approve:
  // deposit:
  // withdraw:
}

export interface TokenService {
  getSupportedTokens: () => Promise<TokenData[]>;
  // getTokenRates:
}
