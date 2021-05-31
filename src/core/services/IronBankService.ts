import { IronBankService, YearnSdk, IronBankMarket } from '@types';

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

  public async getUserCyTokensData({ userAddress }: { userAddress: string }): Promise<any[]> {
    // public async getUserCyTokensData({ userAddress }: { userAddress: string }): Promise<UserCyTokenData[]> {
    //   const yearn = this.yearnSdk;
    //   const ironBank = await yearn.ironBank.assetsPositionsOf(userAddress);
    //   const cyTokenData = ironBank.map(({ positions, metadata }) => {
    //     const lendPosition = positions[0];
    //     const borrowPosition = positions[1];
    //     return {
    //       address: metadata.assetId,
    //       suppliedBalance: lendPosition.underlyingTokenBalance.amount.toString(),
    //       suppliedBalanceUsdc: lendPosition.underlyingTokenBalance.amountUsdc.toString(),
    //       borrowedBalance: borrowPosition.underlyingTokenBalance.amount.toString(),
    //       borrowedBalanceUsdc: borrowPosition.underlyingTokenBalance.amountUsdc.toString(),
    //       allowancesMap: borrowPosition.assetAllowances.reduce((map, allowance) => {
    //         map[allowance.spender] = allowance.amount.toString();
    //         return map;
    //       }, {} as { [key: string]: string }),

    //       enteredMarket: metadata.enteredMarket,
    //       borrowLimit: metadata.borrowLimit.toString(),
    //     };
    //   });
    //   return cyTokenData;
    return [];
  }
}
