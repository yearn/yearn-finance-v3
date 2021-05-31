import { Theme } from './Settings';
import { Status } from './Status';
import { Position, Token, Vault, Integer, Balance, IronBankMarket } from '@types';
import { EthereumAddress } from './Ethereum';
import { IronBankPosition } from '@yfi/sdk';

export interface RootState {
  app: AppState;
  modals: ModalsState;
  route: RouteState;
  theme: ThemeState;
  vaults: VaultsState;
  wallet: WalletState;
  tokens: TokensState;
  ironBank: IronBankState;
  settings: SettingsState;
}

export interface AppState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | undefined;
}

export interface ModalsState {
  activeModal: string | undefined;
  modalProps: any | undefined;
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
  getAllowances: Status;
}
export interface TokensState {
  tokensAddresses: string[];
  tokensMap: { [address: string]: Token };
  user: {
    userTokensAddresses: string[];
    userTokensMap: { [address: string]: Balance };
    userTokensAllowancesMap: { [address: string]: AllowancesMap };
  };
  statusMap: {
    getTokens: Status;
    user: {
      getUserTokens: Status;
      getUserTokensAllowances: Status;
      userTokensActionsMap: { [tokenAddress: string]: UserTokenActionsMap };
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

export interface IronBankMarketPositionsMap {
  LEND: Position;
  BORROW: Position;
}

export interface IronBankState {
  cyTokenAddresses: EthereumAddress[];
  cyTokensMap: { [cyTokenAddress: string]: IronBankMarket };
  address: EthereumAddress;
  selectedCyTokenAddress: EthereumAddress;
  ironBankData: IronBankPosition | undefined;
  user: {
    borrowLimit: string;
    borrowLimitUsed: string;
    userCyTokensMap: { [cyTokenAddress: string]: IronBankMarketPositionsMap };
    marketsAllowancesMap: { [marketAddress: string]: AllowancesMap };
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
export interface SettingsState {
  sidebarCollapsed: boolean;
}
