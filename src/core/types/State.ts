import { Theme } from './Settings';
import { Status } from './Status';
import { Position, Token, Vault, Integer, Balance, IronBankMarket } from '@types';
import { EthereumAddress } from './Ethereum';
import { CyTokenUserMetadata, IronBankPosition } from '@yfi/sdk';

export interface RootState {
  app: AppState;
  modals: ModalsState;
  route: RouteState;
  theme: ThemeState;
  vaults: VaultsState;
  wallet: WalletState;
  tokens: TokensState;
  ironBank: IronBankState;
  labs: LabsState;
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
  approveZapOut: Status;
  deposit: Status;
  withdraw: Status;
  get: Status;
}
export interface UserVaultActionsStatusMap {
  getPosition: Status;
}
export interface VaultPositionsMap {
  DEPOSIT: Position;
}

export interface AllowancesMap {
  [spender: string]: Integer;
}
export interface VaultsState {
  vaultsAddresses: string[];
  vaultsMap: { [address: string]: Vault };
  selectedVaultAddress: EthereumAddress | undefined;
  user: {
    userVaultsPositionsMap: { [address: string]: VaultPositionsMap };
    vaultsAllowancesMap: { [vaultAddress: string]: AllowancesMap };
  };
  statusMap: {
    initiateSaveVaults: Status;
    getVaults: Status;
    vaultsActionsStatusMap: { [vaultAddress: string]: VaultActionsStatusMap };
    user: {
      getUserVaultsPositions: Status;
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
  selectedTokenAddress: EthereumAddress | undefined;
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

export interface MarketActionsStatusMap {
  approve: Status;
  borrow: Status;
  supply: Status;
  repay: Status;
  withdraw: Status;
  enterMarket: Status;
  get: Status;
}
export type MarketActionsTypes = keyof MarketActionsStatusMap;

export interface UserMarketActionsStatusMap {
  getPosition: Status;
  getMetadata: Status;
}

export interface IronBankMarketPositionsMap {
  LEND: Position;
  BORROW: Position;
}

export interface IronBankState {
  marketAddresses: EthereumAddress[];
  marketsMap: { [marketAddress: string]: IronBankMarket };
  selectedMarketAddress: EthereumAddress;
  ironBankData: IronBankPosition | undefined;
  user: {
    userMarketsPositionsMap: { [marketAddress: string]: IronBankMarketPositionsMap };
    userMarketsMetadataMap: { [marketAddress: string]: CyTokenUserMetadata };
    marketsAllowancesMap: { [marketAddress: string]: AllowancesMap };
  };
  statusMap: {
    initiateIronBank: Status;
    getIronBankData: Status;
    getMarkets: Status;
    marketsActionsMap: { [marketAddress: string]: MarketActionsStatusMap };
    user: {
      getUserMarketsPositions: Status;
      getUserMarketsMetadata: Status;
      userMarketsActionsMap: { [marketAddress: string]: UserMarketActionsStatusMap };
    };
  };
}
export interface SettingsState {
  sidebarCollapsed: boolean;
  devMode: {
    enabled: boolean;
    walletAddressOverride: EthereumAddress;
  };
}

export interface LabsPositionsMap {
  DEPOSIT: Position;
  YIELD: Position;
}

export interface LabActionsStatusMap {
  get: Status;
}
export interface UserLabActionsStatusMap {
  get: Status;
}

export interface LabsState {
  labsAddresses: string[];
  labsMap: { [address: string]: any }; // TODO add Lab type when merged with xgambito code.
  selectedLabAddress: EthereumAddress | undefined;
  user: {
    userLabsPositionsMap: { [address: string]: LabsPositionsMap };
    labsAllowancesMap: { [labAddress: string]: AllowancesMap };
  };
  statusMap: {
    initiateLabs: Status;
    getLabs: Status;
    labsActionsStatusMap: { [labAddress: string]: LabActionsStatusMap };
    user: {
      getUserLabsPositions: Status;
      userLabsActionsStatusMap: { [labAddress: string]: UserLabActionsStatusMap };
    };
  };
}
