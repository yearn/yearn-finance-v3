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
  EthereumAddress,
  Integer,
  Wei,
  Balance,
  TransactionOutcome,
  VaultsUserSummary,
  VaultUserMetadata,
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
    userAddress: EthereumAddress;
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
  addresses?: EthereumAddress[];
}

export interface GetExpectedTransactionOutcomeProps {
  transactionType: 'DEPOSIT' | 'WITHDRAW';
  accountAddress: EthereumAddress;
  sourceTokenAddress: EthereumAddress;
  sourceTokenAmount: Wei;
  targetTokenAddress: EthereumAddress;
  slippageTolerance?: number;
}

export interface DepositProps {
  accountAddress: EthereumAddress;
  tokenAddress: EthereumAddress;
  vaultAddress: EthereumAddress;
  amount: Wei;
  slippageTolerance?: number;
}

export interface WithdrawProps {
  accountAddress: EthereumAddress;
  tokenAddress: EthereumAddress;
  vaultAddress: EthereumAddress;
  amountOfShares: Wei;
  slippageTolerance?: number;
}

export interface StakeProps {
  accountAddress: EthereumAddress;
  tokenAddress: EthereumAddress;
  vaultAddress: EthereumAddress;
  amount: Wei;
}

export interface LockProps {
  accountAddress: EthereumAddress;
  tokenAddress: EthereumAddress;
  vaultAddress: EthereumAddress;
  amount: Wei;
}

export interface ClaimProps {
  accountAddress: EthereumAddress;
}

export interface ReinvestProps {
  accountAddress: EthereumAddress;
}

export interface ApproveProps {
  accountAddress: EthereumAddress;
  tokenAddress: EthereumAddress;
  spenderAddress: EthereumAddress;
  amount: Wei;
}

export interface IronBankTransactionProps {
  userAddress: EthereumAddress;
  marketAddress: string;
  amount: Wei;
  action: 'supply' | 'borrow' | 'withdraw' | 'repay';
}
export interface IronBankGenericGetUserDataProps {
  userAddress: EthereumAddress;
  marketAddresses?: string[];
}
export interface EnterMarketsProps {
  userAddress: EthereumAddress;
  marketAddresses: string[];
}

export interface IronBankService {
  getSupportedMarkets: () => Promise<IronBankMarket[]>;
  getUserMarketsPositions: (props: IronBankGenericGetUserDataProps) => Promise<Position[]>;
  getUserMarketsMetadata: (props: IronBankGenericGetUserDataProps) => Promise<CyTokenUserMetadata[]>;
  getUserIronBankSummary: ({ userAddress }: { userAddress: EthereumAddress }) => Promise<IronBankUserSummary>;
  getMarketsDynamicData: (marketAddresses: string[]) => Promise<IronBankMarketDynamic[]>;
  executeTransaction: (props: IronBankTransactionProps) => Promise<TransactionResponse>;
  enterMarkets: (props: EnterMarketsProps) => Promise<TransactionResponse>;
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
  userAddress: EthereumAddress;
}

export interface GetUserLabsMetadataProps {
  userAddress: EthereumAddress;
}
export interface GetUserVaultsSummaryProps {
  userAddress: EthereumAddress;
}
export interface GetUserVaultsMetadataProps {
  userAddress: EthereumAddress;
  vaultsAddresses?: string[];
}
