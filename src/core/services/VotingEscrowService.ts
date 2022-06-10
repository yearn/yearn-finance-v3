import {
  ApproveLockProps,
  ExtendLockTimeProps,
  GetLockAllowanceProps,
  GetSupportedVotingEscrowsProps,
  GetUserVotingEscrowsPositionsProps,
  GetVotingEscrowsDynamicDataProps,
  IncreaseLockAmountProps,
  Position,
  TokenAllowance,
  TransactionResponse,
  VotingEscrow,
  VotingEscrowDynamic,
  VotingEscrowLockProps,
  VotingEscrowService,
  WithdrawLocked,
  WithdrawUnlocked,
  YearnSdk,
  Web3Provider,
  TransactionService,
  Config,
} from '@types';

export class VotingEscrowServiceImpl implements VotingEscrowService {
  private yearnSdk: YearnSdk;
  private web3Provider: Web3Provider;
  private transactionService: TransactionService;
  private config: Config;

  constructor({
    yearnSdk,
    web3Provider,
    transactionService,
    config,
  }: {
    yearnSdk: YearnSdk;
    web3Provider: Web3Provider;
    transactionService: TransactionService;
    config: Config;
  }) {
    this.yearnSdk = yearnSdk;
    this.web3Provider = web3Provider;
    this.transactionService = transactionService;
    this.config = config;
  }

  getSupportedVotingEscrows!: (props: GetSupportedVotingEscrowsProps) => Promise<VotingEscrow[]>;
  getVotingEscrowsDynamicData!: (props: GetVotingEscrowsDynamicDataProps) => Promise<VotingEscrowDynamic[]>;
  getUserVotingEscrowsPositions!: (props: GetUserVotingEscrowsPositionsProps) => Promise<Position[]>;
  getLockAllowance!: (props: GetLockAllowanceProps) => Promise<TokenAllowance>;
  approveLock!: (props: ApproveLockProps) => Promise<TransactionResponse>;
  lock!: (props: VotingEscrowLockProps) => Promise<TransactionResponse>;
  increaseLockAmount!: (props: IncreaseLockAmountProps) => Promise<TransactionResponse>;
  extendLockTime!: (props: ExtendLockTimeProps) => Promise<TransactionResponse>;
  withdrawLocked!: (props: WithdrawLocked) => Promise<TransactionResponse>;
  withdrawUnlocked!: (props: WithdrawUnlocked) => Promise<TransactionResponse>;
}
