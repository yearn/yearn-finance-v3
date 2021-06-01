import {
  IronBankService,
  YearnSdk,
  IronBankMarket,
  Position,
  IronBankPosition,
  IronBankMarketDynamic,
  CyTokenUserMetadata,
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
  }: {
    userAddress: string;
    marketAddresses?: string[];
  }): Promise<Position[]> {
    const yearn = this.yearnSdk;
    return await yearn.ironBank.positionsOf(userAddress, marketAddresses);
  }

  public async getUserMarketsMetadata({
    userAddress,
    marketAddresses,
  }: {
    userAddress: string;
    marketAddresses?: string[];
  }): Promise<CyTokenUserMetadata[]> {
    const yearn = this.yearnSdk;
    return await yearn.ironBank.userMetadata(userAddress);
    // return await yearn.ironBank.userMetadata(userAddress, marketAddresses); // TODO use when sdk updated to receive marketAddresses
  }
}
