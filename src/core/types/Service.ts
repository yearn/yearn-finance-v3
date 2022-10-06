import {
  Vault,
  VaultDynamic,
  Token,
  TokenDynamicData,
  Position,
  Lab,
  LabDynamic,
  LabUserMetadata,
  TransactionResponse,
  Address,
  Integer,
  Wei,
  Balance,
  TransactionOutcome,
  TransactionReceipt,
  VaultsUserSummary,
  VaultUserMetadata,
  GasFees,
  Overrides,
  Network,
  TokenAllowance,
  VotingEscrow,
  VotingEscrowDynamic,
  VotingEscrowUserMetadata,
  VotingEscrowTransactionType,
  Gauge,
  GaugeDynamic,
  GaugeUserMetadata,
  Week,
} from '@types';

// *************** USER ***************

export interface UserService {
  getAddressEnsName: (props: GetAddressEnsNameProps) => Promise<string>;
  getBluePillNftBalance: (address: string) => Promise<number>;
  getWoofyNftBalance: (address: string) => Promise<number>;
  getNftBalance: (address: string) => Promise<NftBalances>;
}

export interface GetAddressEnsNameProps {
  address: string;
}

export interface NftBalances {
  bluePillNftBalance: number;
  woofyNftBalance: number;
}

// *************** VAULT ***************
export interface VaultService {
  getSupportedVaults: (props: GetSupportedVaultsProps) => Promise<Vault[]>;
  getVaultsDynamicData: (props: GetVaultsDynamicDataProps) => Promise<VaultDynamic[]>;
  getUserVaultsPositions: (props: GetUserVaultsPositionsProps) => Promise<Position[]>;
  getUserVaultsSummary: (props: GetUserVaultsSummaryProps) => Promise<VaultsUserSummary>;
  getUserVaultsMetadata: (props: GetUserVaultsMetadataProps) => Promise<VaultUserMetadata[]>;
  getExpectedTransactionOutcome: (props: GetExpectedTransactionOutcomeProps) => Promise<TransactionOutcome>;
  signPermit: (props: SignPermitProps) => Promise<string>;
  deposit: (props: DepositProps) => Promise<TransactionResponse>;
  withdraw: (props: WithdrawProps) => Promise<TransactionResponse>;
  migrate: (props: MigrateProps) => Promise<TransactionResponse>;
  approveDeposit: (props: ApproveDepositProps) => Promise<TransactionResponse>;
  approveZapOut: (props: ApproveZapOutProps) => Promise<TransactionResponse>;
  getDepositAllowance: (props: GetDepositAllowanceProps) => Promise<TokenAllowance>;
  getWithdrawAllowance: (props: GetWithdrawAllowanceProps) => Promise<TokenAllowance>;
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

export interface SignPermitProps {
  network: Network;
  accountAddress: Address;
  vaultAddress: Address;
  spenderAddress: Address;
  amount: Wei;
  deadline: string;
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
  signature?: string;
}

export interface MigrateProps {
  network: Network;
  accountAddress: Address;
  vaultFromAddress: Address;
  vaultToAddress: Address;
  migrationContractAddress: Address;
}

// *************** TOKEN ***************
export interface TokenService {
  getSupportedTokens: (props: GetSupportedTokensProps) => Promise<Token[]>;
  getTokensDynamicData: (props: GetTokensDynamicDataProps) => Promise<TokenDynamicData[]>;
  getUserTokensData: (props: GetUserTokensDataProps) => Promise<Balance[]>;
  getTokenAllowance: (props: GetTokenAllowanceProps) => Promise<Integer>;
  approve: (props: ApproveProps) => Promise<TransactionResponse>;
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

export interface ApproveDepositProps {
  network: Network;
  accountAddress: Address;
  tokenAddress: Address;
  amount: Wei;
  vaultAddress: string;
}

export interface ApproveZapOutProps {
  network: Network;
  amount: Wei;
  accountAddress: string;
  tokenAddress: string;
  vaultAddress: string;
}

export interface GetDepositAllowanceProps {
  network: Network;
  accountAddress: string;
  tokenAddress: string;
  vaultAddress: string;
}

export interface GetWithdrawAllowanceProps {
  network: Network;
  accountAddress: string;
  tokenAddress: string;
  vaultAddress: string;
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

// *************** VOTING ESCROW ***************
export interface VotingEscrowService {
  getSupportedVotingEscrows: (props: GetSupportedVotingEscrowsProps) => Promise<VotingEscrow[]>;
  getVotingEscrowsDynamicData: (props: GetVotingEscrowsDynamicDataProps) => Promise<VotingEscrowDynamic[]>;
  getUserVotingEscrowsPositions: (props: GetUserVotingEscrowsPositionsProps) => Promise<Position[]>;
  getUserVotingEscrowsMetadata: (props: GetUserVotingEscrowsMetadataProps) => Promise<VotingEscrowUserMetadata[]>;
  getExpectedTransactionOutcome: (props: GetVotingEscrowExpectedTransactionOutcomeProps) => Promise<TransactionOutcome>;
  getLockAllowance: (props: GetLockAllowanceProps) => Promise<TokenAllowance>;
  approveLock: (props: ApproveLockProps) => Promise<TransactionResponse>;
  lock: (props: VotingEscrowLockProps) => Promise<TransactionResponse>;
  increaseLockAmount: (props: IncreaseLockAmountProps) => Promise<TransactionResponse>;
  extendLockTime: (props: ExtendLockTimeProps) => Promise<TransactionResponse>;
  withdrawLocked: (props: WithdrawLocked) => Promise<TransactionResponse>;
  withdrawUnlocked: (props: WithdrawUnlocked) => Promise<TransactionResponse>;
}

export interface GetSupportedVotingEscrowsProps {
  network: Network;
  addresses?: Address[];
}

export interface GetVotingEscrowsDynamicDataProps {
  network: Network;
  addresses?: Address[];
}

export interface GetUserVotingEscrowsPositionsProps {
  network: Network;
  accountAddress: Address;
  addresses?: Address[];
}

export interface GetUserVotingEscrowsMetadataProps {
  network: Network;
  accountAddress: Address;
  addresses?: Address[];
}

export interface GetVotingEscrowExpectedTransactionOutcomeProps {
  network: Network;
  accountAddress: Address;
  transactionType: VotingEscrowTransactionType;
  tokenAddress: Address;
  votingEscrowAddress: Address;
  amount?: Wei;
  time?: Week;
}

export interface GetLockAllowanceProps {
  network: Network;
  accountAddress: Address;
  tokenAddress: Address;
  votingEscrowAddress: Address;
}

export interface ApproveLockProps {
  network: Network;
  accountAddress: Address;
  tokenAddress: Address;
  votingEscrowAddress: Address;
  amount: Wei;
}

export interface VotingEscrowLockProps {
  network: Network;
  accountAddress: Address;
  tokenAddress: Address;
  votingEscrowAddress: Address;
  amount: Wei;
  time: Week;
}

export interface IncreaseLockAmountProps {
  network: Network;
  accountAddress: Address;
  votingEscrowAddress: Address;
  amount: Wei;
}

export interface ExtendLockTimeProps {
  network: Network;
  accountAddress: Address;
  votingEscrowAddress: Address;
  time: Week;
}

export interface WithdrawLocked {
  network: Network;
  accountAddress: Address;
  votingEscrowAddress: Address;
}

export interface WithdrawUnlocked {
  network: Network;
  accountAddress: Address;
  votingEscrowAddress: Address;
}

// *************** GAUGE ***************
export interface GaugeService {
  getSupportedGauges: (props: GetSupportedGaugesProps) => Promise<Gauge[]>;
  getGaugesDynamicData: (props: GetGaugesDynamicDataProps) => Promise<GaugeDynamic[]>;
  getUserGaugesPositions: (props: GetUserGaugesPositionsProps) => Promise<Position[]>;
  getUserGaugesMetadata: (props: GetUserGaugesMetadataProps) => Promise<GaugeUserMetadata[]>;
  getStakeAllowance: (props: GetStakeAllowanceProps) => Promise<TokenAllowance>;
  approveStake: (props: ApproveStakeProps) => Promise<TransactionResponse>;
  stake: (props: GaugeStakeProps) => Promise<TransactionResponse>;
  unstake: (props: GaugeUnstakeProps) => Promise<TransactionResponse>;
  claimRewards: (props: ClaimRewardsProps) => Promise<TransactionResponse>;
  claimAllRewards: (props: ClaimAllRewardsProps) => Promise<TransactionResponse>;
}

export interface GetSupportedGaugesProps {
  network: Network;
  addresses?: Address[];
}

export interface GetGaugesDynamicDataProps {
  network: Network;
  addresses?: Address[];
}

export interface GetUserGaugesPositionsProps {
  network: Network;
  accountAddress: Address;
  addresses?: Address[];
}

export interface GetUserGaugesMetadataProps {
  network: Network;
  accountAddress: Address;
  addresses?: Address[];
}

export interface GetStakeAllowanceProps {
  network: Network;
  accountAddress: Address;
  tokenAddress: Address;
  gaugeAddress: Address;
}

export interface ApproveStakeProps {
  network: Network;
  accountAddress: Address;
  tokenAddress: Address;
  gaugeAddress: Address;
  amount: Wei;
}

export interface GaugeStakeProps {
  network: Network;
  accountAddress: Address;
  tokenAddress: Address;
  gaugeAddress: Address;
  amount: Wei;
}

export interface GaugeUnstakeProps {
  network: Network;
  accountAddress: Address;
  gaugeAddress: Address;
  amount: Wei;
}

export interface ClaimRewardsProps {
  network: Network;
  accountAddress: Address;
  gaugeAddress: Address;
}

export interface ClaimAllRewardsProps {
  network: Network;
  accountAddress: Address;
}

// *************** TRANSACTION ***************

export interface TransactionService {
  execute: (props: ExecuteTransactionProps) => Promise<TransactionResponse>;
  handleTransaction: (props: HandleTransactionProps) => Promise<TransactionReceipt>;
}

export interface ExecuteTransactionProps {
  network: Network;
  args?: Array<any>;
  overrides?: Overrides;
  methodName: string;
  abi: any;
  contractAddress: Address;
}
export interface HandleTransactionProps {
  tx: TransactionResponse;
  network: Network;
  useExternalService?: boolean;
  renderNotification?: boolean;
}

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
