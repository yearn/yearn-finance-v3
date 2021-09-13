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
} from '@types';

export interface GetAddressEnsNameProps {
  address: string;
}
export interface UserService {
  getAddressEnsName: (props: GetAddressEnsNameProps) => Promise<string>;
}

export interface VaultService {
  getSupportedVaults: (props: GetSupportedVaultsProps) => Promise<Vault[]>;
  getVaultsDynamicData: (props: any) => Promise<VaultDynamic[]>;
  getUserVaultsPositions: ({
    userAddress,
    vaultAddresses,
  }: {
    userAddress: Address;
    vaultAddresses?: string[];
  }) => Promise<Position[]>;
  getUserVaultsSummary: (props: GetUserVaultsSummaryProps) => Promise<VaultsUserSummary>;
  getUserVaultsMetadata: (props: GetUserVaultsMetadataProps) => Promise<VaultUserMetadata[]>;
  getExpectedTransactionOutcome: (props: GetExpectedTransactionOutcomeProps) => Promise<TransactionOutcome>;
  // approve:
  deposit: (props: DepositProps) => Promise<TransactionResponse>;
  withdraw: (props: WithdrawProps) => Promise<TransactionResponse>;
  // approveMigrate:
  // migrate:
}

export interface TokenService {
  getSupportedTokens: () => Promise<Token[]>;
  getTokensDynamicData: (props: string[]) => Promise<TokenDynamicData[]>;
  getUserTokensData: (accountAddress: string, tokenAddress?: string[]) => Promise<Balance[]>;
  getTokenAllowance: (accountAddress: string, tokenAddress: string, spenderAddress: string) => Promise<Integer>;
  approve: (props: ApproveProps) => Promise<TransactionResponse>;
  // getTokenRates:
}

export interface GetSupportedVaultsProps {
  addresses?: Address[];
}

export interface GetExpectedTransactionOutcomeProps {
  transactionType: 'DEPOSIT' | 'WITHDRAW';
  accountAddress: Address;
  sourceTokenAddress: Address;
  sourceTokenAmount: Wei;
  targetTokenAddress: Address;
  slippageTolerance?: number;
}

export interface DepositProps {
  accountAddress: Address;
  tokenAddress: Address;
  vaultAddress: Address;
  amount: Wei;
  slippageTolerance?: number;
}

export interface WithdrawProps {
  accountAddress: Address;
  tokenAddress: Address;
  vaultAddress: Address;
  amountOfShares: Wei;
  slippageTolerance?: number;
}

export interface StakeProps {
  accountAddress: Address;
  tokenAddress: Address;
  vaultAddress: Address;
  amount: Wei;
}

export interface LockProps {
  accountAddress: Address;
  tokenAddress: Address;
  vaultAddress: Address;
  amount: Wei;
}

export interface ClaimProps {
  accountAddress: Address;
}

export interface ReinvestProps {
  accountAddress: Address;
}

export interface ApproveProps {
  accountAddress: Address;
  tokenAddress: Address;
  spenderAddress: Address;
  amount: Wei;
}

export interface IronBankTransactionProps {
  userAddress: Address;
  marketAddress: string;
  amount: Wei;
  action: 'supply' | 'borrow' | 'withdraw' | 'repay';
}
export interface IronBankGenericGetUserDataProps {
  userAddress: Address;
  marketAddresses?: string[];
}
export interface EnterOrExitMarketProps {
  userAddress: Address;
  marketAddress: string;
  actionType: 'enterMarket' | 'exitMarket';
}

export interface IronBankService {
  getSupportedMarkets: () => Promise<IronBankMarket[]>;
  getUserMarketsPositions: (props: IronBankGenericGetUserDataProps) => Promise<Position[]>;
  getUserMarketsMetadata: (props: IronBankGenericGetUserDataProps) => Promise<CyTokenUserMetadata[]>;
  getUserIronBankSummary: ({ userAddress }: { userAddress: Address }) => Promise<IronBankUserSummary>;
  getMarketsDynamicData: (marketAddresses: string[]) => Promise<IronBankMarketDynamic[]>;
  executeTransaction: (props: IronBankTransactionProps) => Promise<TransactionResponse>;
  enterOrExitMarket: (props: EnterOrExitMarketProps) => Promise<TransactionResponse>;
}

export interface SubscriptionProps {
  module: string;
  event: string;
  action: (...args: any[]) => void;
}

export interface SubscriptionService {
  subscribe: (props: SubscriptionProps) => void;
  unsubscribe: (props: SubscriptionProps) => void;
}

export interface LabService {
  getSupportedLabs: () => Promise<{ labsData: Lab[]; errors: string[] }>;
  getLabsDynamicData: () => Promise<LabDynamic[]>;
  getUserLabsPositions: (props: GetUserLabsPositionsProps) => Promise<{ positions: Position[]; errors: string[] }>;
  getUserLabsMetadata: (props: GetUserLabsMetadataProps) => Promise<LabUserMetadata[]>;
  deposit: (props: DepositProps) => Promise<TransactionResponse>;
  withdraw: (props: WithdrawProps) => Promise<TransactionResponse>;
  stake: (props: StakeProps) => Promise<TransactionResponse>;
  lock: (props: LockProps) => Promise<TransactionResponse>;
  claim: (props: ClaimProps) => Promise<TransactionResponse>;
  reinvest: (props: ReinvestProps) => Promise<TransactionResponse>;
}

export interface GetUserLabsPositionsProps {
  userAddress: Address;
}

export interface GetUserLabsMetadataProps {
  userAddress: Address;
}
export interface GetUserVaultsSummaryProps {
  userAddress: Address;
}
export interface GetUserVaultsMetadataProps {
  userAddress: Address;
  vaultsAddresses?: string[];
}

export interface GasService {
  getGasFees: () => Promise<GasFees>;
}

export interface TransactionService {
  execute: (props: ExecuteTransactionProps) => Promise<TransactionResponse>;
}

export interface ExecuteTransactionProps {
  fn: ContractFunction;
  args?: Array<any>;
  overrides?: Overrides;
}

type ContractFunction = (...args: Array<any>) => Promise<TransactionResponse>;
