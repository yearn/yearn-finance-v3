import { Theme } from './Settings';
import { Status } from './Status';
import { TokenData, UserTokenData, UserVaultData, VaultData } from '@types';
import { EthereumAddress } from './Ethereum';

export interface RootState {
  app: AppState;
  route: RouteState;
  theme: ThemeState;
  vaults: VaultsState;
  wallet: WalletState;
  user: UserState;
  tokens: TokensState;
}

export interface AppState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | undefined;
}

export interface RouteState {
  path: string | undefined;
}

export interface ThemeState {
  current: Theme;
}

export interface VaultActionsStatusMap {
  approve: Status;
  deposit: Status;
  withdraw: Status;
}
export interface VaultsState {
  saveVaultsAddreses: string[];
  vaultsMap: { [address: string]: VaultData };
  selectedVaultAddress: EthereumAddress | undefined;
  statusMap: {
    initiateSaveVaults: Status;
    getVaults: Status;
    vaultsActionsStatusMap: { [vaultAddress: string]: VaultActionsStatusMap };
  };
}

export interface WalletState {
  selectedAddress: string | undefined;
  networkVersion: number | undefined;
  balance: string | undefined;
  name: string | undefined;
  isConnected: boolean;
  isLoading: boolean;
  error: string | undefined;
}
export interface UserState {
  userVaultsMap: { [address: string]: UserVaultData };
  userTokensMap: { [address: string]: UserTokenData };
  statusMap: {
    getUserVaults: Status;
  };
}
export interface TokensState {
  tokensAddresses: string[];
  tokensMap: { [address: string]: TokenData };
  statusMap: {
    getTokens: Status;
  };
}
