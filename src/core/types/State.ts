import { Alert } from './Alerts';
import { Address, Network } from './Blockchain';
import { ExternalServiceId } from './General';
import { PartnerId } from './Partner';
import { Theme } from './Settings';
import { Status } from './Status';
import {
  LineActionsStatusMap,
  CreditLinePage,
  UserLineMetadataStatusMap,
  AggregatedCreditLine,
  PositionSummary,
} from './CreditLine';
import {
  Position,
  Token,
  Vault,
  Integer,
  Balance,
  Lab,
  VaultsUserSummary,
  VaultUserMetadata,
  TransactionOutcome,
} from './Yearn-Sdk';

export interface RootState {
  app: AppState;
  alerts: AlertsState;
  modals: ModalsState;
  network: NetworkState;
  route: RouteState;
  theme: ThemeState;
  vaults: VaultsState;
  wallet: WalletState;
  tokens: TokensState;
  settings: SettingsState;
  // user: UserState;
  partner: PartnerState;
  // debt dao
  lines: CreditLineState;
  collateral: CollateralState;
}

export interface AppState {
  isInitialized: boolean;
  servicesEnabled: Record<ExternalServiceId, boolean>;
  statusMap: {
    initApp: Status;
    getAppData: Status;
    clearAppData: Status;
    user: {
      getUserAppData: Status;
      clearUserAppData: Status;
    };
  };
}

export interface NetworkState {
  current: Network;
}

export interface ModalsState {
  activeModal: string | undefined;
  modalProps: any | undefined;
}

export interface AlertsState {
  alertsList: Alert[];
}

export interface RouteState {
  path: string | undefined;
}

export interface ThemeState {
  current: Theme;
}

export interface VaultActionsStatusMap {
  get: Status;
  approve: Status;
  deposit: Status;
  approveZapOut: Status;
  signZapOut: Status;
  withdraw: Status;
  approveMigrate: Status;
  migrate: Status;
}

export interface UserVaultActionsStatusMap {
  getPosition: Status;
  getMetadata: Status;
}

export interface VaultPositionsMap {
  DEPOSIT: Position;
}

export interface AllowancesMap {
  [spender: string]: Integer;
}

export interface VaultTransaction {
  expectedOutcome: TransactionOutcome | undefined;
}

export interface CreditLineState {
  selectedLineAddress: string | undefined;
  selectedPosition: string | undefined;
  linesMap: { [lineAddress: string]: AggregatedCreditLine };
  // probs can just consolidate line/linePage since we need a lot of derived data in linePage for basic functionality
  pagesMap: { [lineAddress: string]: CreditLinePage };
  categories: { [category: string]: string[] };
  user: {
    linePositions: { [positionId: string]: PositionSummary };
    lineAllowances: { [line: string]: { [token: string]: Integer } };
  };
  statusMap: {
    getLines: Status;
    getLine: Status;
    getLinePage: Status;
    getAllowances: Status;
    deploySecuredLine: Status;
    user: UserLineMetadataStatusMap;
  };
}

export interface VaultsState {
  vaultsAddresses: string[];
  vaultsMap: { [address: string]: Vault };
  selectedVaultAddress: Address | undefined;
  transaction: VaultTransaction;
  user: {
    userVaultsSummary: VaultsUserSummary | undefined;
    userVaultsPositionsMap: { [address: string]: VaultPositionsMap };
    userVaultsMetadataMap: { [address: string]: VaultUserMetadata };
    vaultsAllowancesMap: { [vaultAddress: string]: AllowancesMap };
  };
  statusMap: {
    initiateSaveVaults: Status;
    getVaults: Status;
    vaultsActionsStatusMap: { [vaultAddress: string]: VaultActionsStatusMap };
    getExpectedTransactionOutcome: Status;
    user: {
      getUserVaultsSummary: Status;
      getUserVaultsPositions: Status;
      getUserVaultsMetadata: Status;
      userVaultsActionsStatusMap: { [vaultAddress: string]: UserVaultActionsStatusMap };
    };
  };
}

export interface WalletState {
  selectedAddress: string | undefined;
  addressEnsName: string | undefined;
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
  selectedTokenAddress: Address | undefined;
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

export interface CollateralState {
  selectedEscrow?: Address;
  selectedSpigot?: Address;
  selectedRevenueContract?: Address;
  selectedCollateralToken?: Address;
  // collateralTradeData?: ZeroExApiResponse;
  user: {
    escrowAllowances: { [line: string]: { [token: string]: string } };
  };
  statusMap: CollateralActionsStatusMap;
}

interface TokenCollateralMap {
  [contract: string]: { [token: string]: Status };
}
export interface CollateralActionsStatusMap {
  getLineCollateralData: Status;
  approve: TokenCollateralMap;
  addCollateral: TokenCollateralMap;
  enableCollateral: TokenCollateralMap;
  addSpigot: Status;
  releaseSpigot: Status;
  updateOwnerSplit: Status;
}

export interface SettingsState {
  stateVersion: number;
  sidebarCollapsed: boolean;
  defaultSlippage: number;
  signedApprovalsEnabled: boolean;
  devMode: {
    enabled: boolean;
    walletAddressOverride: Address;
  };
}

export interface UserState {
  nft: {
    bluePillNftBalance: number;
    woofyNftBalance: number;
  };
  statusMap: {
    getNftBalance: Status;
  };
}

export interface PartnerState {
  id: PartnerId | undefined;
  address: Address | undefined;
}
