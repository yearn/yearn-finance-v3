import { IronBankService, YearnSdk, IronBankMarket, Position } from '@types';

export class IronBankServiceImpl implements IronBankService {
  private yearnSdk: YearnSdk;

  constructor({ yearnSdk }: { yearnSdk: YearnSdk }) {
    this.yearnSdk = yearnSdk;
  }

  public async getIronBankData({ userAddress }: { userAddress: string | undefined }): Promise<any> {
    // const yearn = this.yearnSdk;
    // const ironBank = await yearn.ironBank.getIronBank(userAddress);

    return;
  }

  public async getSupportedCyTokens(): Promise<IronBankMarket[]> {
    const yearn = this.yearnSdk;
    return await yearn.ironBank.get();
  }

  public async getUserCyTokensData({
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
