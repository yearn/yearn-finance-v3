import { Theme } from './Settings';
import { Status } from './Status';
import { TokenData, UserTokenData, UserVaultData, VaultData, CyTokenData, UserCyTokenData } from '@types';
import { EthereumAddress } from './Ethereum';

export interface RootState {
  app: AppState;
  route: RouteState;
  theme: ThemeState;
  vaults: VaultsState;
  wallet: WalletState;
  tokens: TokensState;
  ironBank: IronBankState;
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
  get: Status;
}
export interface UserVaultActionsStatusMap {
  get: Status;
}
export interface VaultsState {
  saveVaultsAddreses: string[];
  vaultsMap: { [address: string]: VaultData };
  selectedVaultAddress: EthereumAddress | undefined;
  user: {
    userVaultsMap: { [address: string]: UserVaultData };
  };
  statusMap: {
    initiateSaveVaults: Status;
    getVaults: Status;
    getUserVaults: Status;
    vaultsActionsStatusMap: { [vaultAddress: string]: VaultActionsStatusMap };
    userVaultsActionsStatusMap: { [vaultAddress: string]: UserVaultActionsStatusMap };
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

export interface UserVaultActionsMap {
  get: Status;
}
export interface UserTokenActionsMap {
  get: Status;
}
export interface TokensState {
  tokensAddresses: string[];
  tokensMap: { [address: string]: TokenData };
  user: {
    userTokensMap: { [address: string]: UserTokenData };
  };
  statusMap: {
    getTokens: Status;
    getUserTokens: Status;
    userTokensActiosMap: { [address: string]: { get: Status } };
  };
}

export interface CyTokenActionsStatusMap {
  approve: Status;
  borrow: Status;
  supply: Status;
  replay: Status;
  withdraw: Status;
  get: Status;
}

export interface UserCyTokenActionsStatusMap {
  get: Status;
}

export interface IronBankState {
  cyTokenAddresses: EthereumAddress[];
  cyTokensMap: { [cyTokenAddress: string]: CyTokenData };
  address: EthereumAddress;
  selectedCyTokenAddress: EthereumAddress;
  user: {
    borrowLimit: string;
    borrowLimitUsed: string;
    userCyTokensMap: { [cyTokenAddress: string]: UserCyTokenData };
  };
  statusMap: {
    initiateIronBank: Status;
    getIronBankData: Status;
    getCYTokens: Status;
    cyTokensActionsMap: { [cyTokenAddress: string]: CyTokenActionsStatusMap };
    user: {
      getUserCYTokens: Status;
      userCyTokensActionsMap: { [cyTokenAddress: string]: UserCyTokenActionsStatusMap };
    };
  };
}
