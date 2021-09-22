import {
  Vault,
  VaultDynamic,
  Token,
  TokenDynamicData,
  Position,
  IronBankMarket,
  CyTokenUserMetadata,
  IronBankMarketDynamic,
  IronBankUserSummary,
  Lab,
  LabDynamic,
  LabUserMetadata,
  TransactionResponse,
  Address,
  Integer,
  Wei,
  Balance,
  TransactionOutcome,
  VaultsUserSummary,
  VaultUserMetadata,
  GasFees,
  Overrides,
  Network,
} from '@types';

// *************** USER ***************

export interface UserService {
  getAddressEnsName: (props: GetAddressEnsNameProps) => Promise<string>;
}

export interface GetAddressEnsNameProps {
  address: string;
}

// *************** VAULT ***************
export interface VaultService {
  getSupportedVaults: (props: GetSupportedVaultsProps) => Promise<Vault[]>;
  getVaultsDynamicData: (props: GetVaultsDynamicDataProps) => Promise<VaultDynamic[]>;
  getUserVaultsPositions: (props: GetUserVaultsPositionsProps) => Promise<Position[]>;
  getUserVaultsSummary: (props: GetUserVaultsSummaryProps) => Promise<VaultsUserSummary>;
  getUserVaultsMetadata: (props: GetUserVaultsMetadataProps) => Promise<VaultUserMetadata[]>;
  getExpectedTransactionOutcome: (props: GetExpectedTransactionOutcomeProps) => Promise<TransactionOutcome>;
  deposit: (props: DepositProps) => Promise<TransactionResponse>;
  withdraw: (props: WithdrawProps) => Promise<TransactionResponse>;
}

export interface GetSupportedVaultsProps {
  network: Network;
  addresses?: Address[];
}

export interface GetVaultsDynamicDataProps {
  network: Network;
  addresses?: Address[];
}

export interface GetUserVaultsPositionsProps {
  network: Network;
  userAddress: Address;
  vaultAddresses?: string[];
}

export interface GetUserVaultsSummaryProps {
  network: Network;
  userAddress: Address;
}

export interface GetUserVaultsMetadataProps {
  network: Network;
  userAddress: Address;
  vaultsAddresses?: string[];
}

export interface GetExpectedTransactionOutcomeProps {
  network: Network;
  transactionType: 'DEPOSIT' | 'WITHDRAW';
  accountAddress: Address;
  sourceTokenAddress: Address;
  sourceTokenAmount: Wei;
  targetTokenAddress: Address;
  slippageTolerance?: number;
}

export interface DepositProps {
  network: Network;
  accountAddress: Address;
  tokenAddress: Address;
  vaultAddress: Address;
  amount: Wei;
  slippageTolerance?: number;
}

export interface WithdrawProps {
  network: Network;
  accountAddress: Address;
  tokenAddress: Address;
  vaultAddress: Address;
  amountOfShares: Wei;
  slippageTolerance?: number;
}

// *************** TOKEN ***************
export interface TokenService {
  getSupportedTokens: (props: GetSupportedTokensProps) => Promise<Token[]>;
  getTokensDynamicData: (props: GetTokensDynamicDataProps) => Promise<TokenDynamicData[]>;
  getUserTokensData: (props: GetUserTokensDataProps) => Promise<Balance[]>;
  getTokenAllowance: (props: GetTokenAllowanceProps) => Promise<Integer>;
  approve: (props: ApproveProps) => Promise<TransactionResponse>;
  // getTokenRates:
}

export interface GetSupportedTokensProps {
  network: Network;
}

export interface GetTokensDynamicDataProps {
  network: Network;
  addresses: string[];
}

export interface GetUserTokensDataProps {
  network: Network;
  accountAddress: string;
  tokenAddresses?: string[];
}

export interface GetTokenAllowanceProps {
  network: Network;
  accountAddress: string;
  tokenAddress: string;
  spenderAddress: string;
}

export interface ApproveProps {
  network: Network;
  accountAddress: Address;
  tokenAddress: Address;
  spenderAddress: Address;
  amount: Wei;
}

// *************** LABS ***************
export interface LabService {
  getSupportedLabs: (props: GetSupportedLabsProps) => Promise<{ labsData: Lab[]; errors: string[] }>;
  getLabsDynamicData: (props: GetLabsDynamicDataProps) => Promise<LabDynamic[]>;
  getUserLabsPositions: (props: GetUserLabsPositionsProps) => Promise<{ positions: Position[]; errors: string[] }>;
  getUserLabsMetadata: (props: GetUserLabsMetadataProps) => Promise<LabUserMetadata[]>;
  deposit: (props: DepositProps) => Promise<TransactionResponse>;
  withdraw: (props: WithdrawProps) => Promise<TransactionResponse>;
  stake: (props: StakeProps) => Promise<TransactionResponse>;
  lock: (props: LockProps) => Promise<TransactionResponse>;
  claim: (props: ClaimProps) => Promise<TransactionResponse>;
  reinvest: (props: ReinvestProps) => Promise<TransactionResponse>;
}

export interface GetSupportedLabsProps {
  network: Network;
}

export interface GetLabsDynamicDataProps {
  network: Network;
}

export interface GetUserLabsPositionsProps {
  network: Network;
  userAddress: Address;
}

export interface GetUserLabsMetadataProps {
  userAddress: Address;
}

export interface StakeProps {
  network: Network;
  accountAddress: Address;
  tokenAddress: Address;
  vaultAddress: Address;
  amount: Wei;
}

export interface LockProps {
  network: Network;
  accountAddress: Address;
  tokenAddress: Address;
  vaultAddress: Address;
  amount: Wei;
}

export interface ClaimProps {
  network: Network;
  accountAddress: Address;
}

export interface ReinvestProps {
  network: Network;
  accountAddress: Address;
}

// *************** IRON BANK ***************

export interface IronBankService {
  getSupportedMarkets: (props: GetSupportedMarketsProps) => Promise<IronBankMarket[]>;
  getUserMarketsPositions: (props: IronBankGenericGetUserDataProps) => Promise<Position[]>;
  getUserMarketsMetadata: (props: IronBankGenericGetUserDataProps) => Promise<CyTokenUserMetadata[]>;
  getUserIronBankSummary: (props: GetUserIronBankSummaryProps) => Promise<IronBankUserSummary>;
  getMarketsDynamicData: (props: GetMarketDynamicDataProps) => Promise<IronBankMarketDynamic[]>;
  executeTransaction: (props: IronBankTransactionProps) => Promise<TransactionResponse>;
  enterOrExitMarket: (props: EnterOrExitMarketProps) => Promise<TransactionResponse>;
}

export interface GetSupportedMarketsProps {
  network: Network;
}

export interface IronBankGenericGetUserDataProps {
  network: Network;
  userAddress: Address;
  marketAddresses?: string[];
}

export interface GetUserIronBankSummaryProps {
  network: Network;
  userAddress: Address;
}

export interface GetMarketDynamicDataProps {
  network: Network;
  marketAddresses: string[];
}

export interface IronBankTransactionProps {
  network: Network;
  userAddress: Address;
  marketAddress: string;
  amount: Wei;
  action: 'supply' | 'borrow' | 'withdraw' | 'repay';
}

export interface EnterOrExitMarketProps {
  network: Network;
  userAddress: Address;
  marketAddress: string;
  actionType: 'enterMarket' | 'exitMarket';
}

// *************** TRANSACTION ***************

export interface TransactionService {
  execute: (props: ExecuteTransactionProps) => Promise<TransactionResponse>;
}

export interface ExecuteTransactionProps {
  network: Network;
  fn: ContractFunction;
  args?: Array<any>;
  overrides?: Overrides;
}

type ContractFunction = (...args: Array<any>) => Promise<TransactionResponse>;

// *************** GAS ***************

export interface GasService {
  getGasFees: () => Promise<GasFees>;
}

// *************** SUBSCRIPTION ***************
export interface SubscriptionProps {
  module: string;
  event: string;
  action: (...args: any[]) => void;
}

export interface SubscriptionService {
  subscribe: (props: SubscriptionProps) => void;
  unsubscribe: (props: SubscriptionProps) => void;
}
