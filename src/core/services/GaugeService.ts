import {
  ApproveStakeProps,
  ClaimRewardsProps,
  ClaimAllRewardsProps,
  Gauge,
  GaugeDynamic,
  GaugeService,
  GaugeStakeProps,
  GaugeUnstakeProps,
  GetGaugesDynamicDataProps,
  GetStakeAllowanceProps,
  GetSupportedGaugesProps,
  GetUserGaugesPositionsProps,
  Position,
  TokenAllowance,
  TransactionResponse,
  YearnSdk,
  Web3Provider,
  TransactionService,
  Config,
} from '@types';

export class GaugeServiceImpl implements GaugeService {
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

  getSupportedGauges!: (props: GetSupportedGaugesProps) => Promise<Gauge[]>;
  getGaugesDynamicData!: (props: GetGaugesDynamicDataProps) => Promise<GaugeDynamic[]>;
  getUserGaugesPositions!: (props: GetUserGaugesPositionsProps) => Promise<Position[]>;
  getStakeAllowance!: (props: GetStakeAllowanceProps) => Promise<TokenAllowance>;
  approveStake!: (props: ApproveStakeProps) => Promise<TransactionResponse>;
  stake!: (props: GaugeStakeProps) => Promise<TransactionResponse>;
  unstake!: (props: GaugeUnstakeProps) => Promise<TransactionResponse>;
  claimRewards!: (props: ClaimRewardsProps) => Promise<TransactionResponse>;
  claimAllRewards!: (props: ClaimAllRewardsProps) => Promise<TransactionResponse>;
}
