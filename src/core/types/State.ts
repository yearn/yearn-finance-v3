import { Theme } from './Settings';
import { Status } from './Status';
import { UserTokenData, CyTokenData, UserCyTokenData } from '@types';
import { EthereumAddress } from './Ethereum';
import { Position, Token, Vault } from '@yfi/sdk';
import { Integer } from '@yfi/sdk/dist/common';

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
export interface VaultPositionsMap {
  DEPOSIT: Position;
}

interface AllowancesMap {
  [spender: string]: Integer;
}
export interface VaultsState {
  vaultsAddresses: string[];
  vaultsMap: { [address: string]: Vault };
  selectedVaultAddress: EthereumAddress | undefined;
  user: {
    userVaultsMap: { [address: string]: VaultPositionsMap };
    vaultsAllowancesMap: { [vaultAddress: string]: AllowancesMap };
  };
  statusMap: {
    initiateSaveVaults: Status;
    getVaults: Status;
    vaultsActionsStatusMap: { [vaultAddress: string]: VaultActionsStatusMap };
    user: {
      getUserVaults: Status;
      userVaultsActionsStatusMap: { [vaultAddress: string]: UserVaultActionsStatusMap };
    };
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
  tokensMap: { [address: string]: Token };
  user: {
    userTokensMap: { [address: string]: UserTokenData };
  };
  statusMap: {
    getTokens: Status;
    user: {
      getUserTokens: Status;
      userTokensActiosMap: { [address: string]: UserTokenActionsMap };
    };
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
