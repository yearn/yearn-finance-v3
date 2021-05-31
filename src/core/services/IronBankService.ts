import { IronBankService, YearnSdk, IronBankMarket, Position, IronBankPosition, IronBankMarketDynamic } from '@types';

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

  public async getUserMarketsData({
    userAddress,
    marketAddresses,
  }: {
    userAddress: string;
    marketAddresses?: string[];
  }): Promise<Position[]> {
    const yearn = this.yearnSdk;
    return await yearn.ironBank.positionsOf(userAddress, marketAddresses);
  }
}
