import {
  IronBankService,
  YearnSdk,
  IronBankMarket,
  Position,
  IronBankPosition,
  IronBankMarketDynamic,
  CyTokenUserMetadata,
  EnterMarketsProps,
  IronBankGenericGetUserDataProps,
  IronBankTransactionProps,
} from '@types';

export class IronBankServiceImpl implements IronBankService {
  private yearnSdk: YearnSdk;

  constructor({ yearnSdk }: { yearnSdk: YearnSdk }) {
    this.yearnSdk = yearnSdk;
  }

  public async getIronBankData({ userAddress }: { userAddress: string }): Promise<IronBankPosition> {
    const yearn = this.yearnSdk;
    return await yearn.ironBank.generalPositionOf(userAddress);
  }

  public async getSupportedMarkets(): Promise<IronBankMarket[]> {
    const yearn = this.yearnSdk;
    return await yearn.ironBank.get();
  }

  public async getMarketsDynamicData(marketAddresses: string[]): Promise<IronBankMarketDynamic[]> {
    const yearn = this.yearnSdk;
    return await yearn.ironBank.getDynamic(marketAddresses);
  }

  public async getUserMarketsPositions({
    userAddress,
    marketAddresses,
  }: IronBankGenericGetUserDataProps): Promise<Position[]> {
    const yearn = this.yearnSdk;
    return await yearn.ironBank.positionsOf(userAddress, marketAddresses);
  }

  public async getUserMarketsMetadata({
    userAddress,
    marketAddresses,
  }: IronBankGenericGetUserDataProps): Promise<CyTokenUserMetadata[]> {
    const yearn = this.yearnSdk;
    return await yearn.ironBank.userMetadata(userAddress);
    // return await yearn.ironBank.userMetadata(userAddress, marketAddresses); // TODO use when sdk updated to receive marketAddresses
  }

  public async executeTransaction({
    userAddress,
    marketAddress,
    amount,
    action,
  }: IronBankTransactionProps): Promise<any> {
    // const yearn = this.yearnSdk;
    // return await yearn.ironBank[action](userAddress, marketAddress, amount); // TODO use when sdk uready
    return;
  }

  public async enterMarkets({ marketAddresses }: EnterMarketsProps): Promise<any> {
    // const yearn = this.yearnSdk;
    // return await yearn.ironBank.enterMarkets(marketAddresses); // TODO use when sdk uready
    return;
  }
}
