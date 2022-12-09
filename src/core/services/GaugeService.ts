import {
  ApproveStakeProps,
  ClaimRewardsProps,
  ClaimAllRewardsProps,
  Gauge,
  GaugeDynamic,
  GaugeService,
  GaugeStakeProps,
  GaugeUnstakeProps,
  GaugeUserMetadata,
  GetGaugesDynamicDataProps,
  GetStakeAllowanceProps,
  GetSupportedGaugesProps,
  GetUserGaugesPositionsProps,
  GetUserGaugesMetadataProps,
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

  public async getSupportedGauges({ network, addresses }: GetSupportedGaugesProps): Promise<Gauge[]> {
    const yearn = this.yearnSdk.getInstanceOf(network);
    return await yearn.gauges.get({ addresses });
  }

  public async getGaugesDynamicData({ network, addresses }: GetGaugesDynamicDataProps): Promise<GaugeDynamic[]> {
    const yearn = this.yearnSdk.getInstanceOf(network);
    return await yearn.gauges.getDynamic({ addresses });
  }

  public async getUserGaugesPositions({
    network,
    accountAddress,
    addresses,
  }: GetUserGaugesPositionsProps): Promise<Position[]> {
    const yearn = this.yearnSdk.getInstanceOf(network);
    return await yearn.gauges.positionsOf({ accountAddress, addresses });
  }

  public async getUserGaugesMetadata({
    network,
    accountAddress,
    addresses,
  }: GetUserGaugesMetadataProps): Promise<GaugeUserMetadata[]> {
    const yearn = this.yearnSdk.getInstanceOf(network);
    return await yearn.gauges.metadataOf({ accountAddress, addresses });
  }

  public async getStakeAllowance({
    network,
    accountAddress,
    tokenAddress,
    gaugeAddress,
  }: GetStakeAllowanceProps): Promise<TokenAllowance> {
    const yearn = this.yearnSdk.getInstanceOf(network);
    return await yearn.gauges.getStakeAllowance({ accountAddress, tokenAddress, gaugeAddress });
  }

  public async approveStake({
    network,
    accountAddress,
    tokenAddress,
    gaugeAddress,
    amount,
  }: ApproveStakeProps): Promise<TransactionResponse> {
    const yearn = this.yearnSdk.getInstanceOf(network);
    return await yearn.gauges.approveStake({ accountAddress, tokenAddress, gaugeAddress, amount });
  }

  public async stake({
    network,
    accountAddress,
    tokenAddress,
    gaugeAddress,
    amount,
  }: GaugeStakeProps): Promise<TransactionResponse> {
    const yearn = this.yearnSdk.getInstanceOf(network);
    return await yearn.gauges.stake({ accountAddress, tokenAddress, gaugeAddress, amount });
  }

  public async unstake({ network, accountAddress, gaugeAddress }: GaugeUnstakeProps): Promise<TransactionResponse> {
    const yearn = this.yearnSdk.getInstanceOf(network);
    return await yearn.gauges.unstake({ accountAddress, gaugeAddress, amount: '0' }); // TODO amount needed?
  }

  public async claimRewards({
    network,
    accountAddress,
    gaugeAddress,
  }: ClaimRewardsProps): Promise<TransactionResponse> {
    const yearn = this.yearnSdk.getInstanceOf(network);
    return await yearn.gauges.claimRewards({ accountAddress, gaugeAddress });
  }

  public async claimAllRewards({ network, accountAddress }: ClaimAllRewardsProps): Promise<TransactionResponse> {
    const yearn = this.yearnSdk.getInstanceOf(network);
    return await yearn.gauges.claimAllRewards({ accountAddress });
  }
}
