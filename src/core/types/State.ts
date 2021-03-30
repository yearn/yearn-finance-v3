import { Theme } from './Settings';
import { Status } from './Status';
import { UserTokenData } from './UserToken';
import { UserVaultData } from './UserVault';
import { VaultData } from './Vault';

export interface RootState {
  app: AppState;
  route: RouteState;
  theme: ThemeState;
  vaults: VaultsState;
  wallet: WalletState;
  user: UserState;
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

export interface VaultsState {
  saveVaultsAddreses: string[];
  vaultsMap: { [address: string]: VaultData };
  statusMap: {
    initiateSaveVaults: Status;
    getVaults: Status;
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
