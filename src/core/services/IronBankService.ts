import { IronBankService, CyTokenData, UserCyTokenData, YearnSdk } from '@types';

export class IronBankServiceImpl implements IronBankService {
  private yearnSdk: YearnSdk;

  constructor({ yearnSdk }: { yearnSdk: YearnSdk }) {
    this.yearnSdk = yearnSdk;
  }

  public async getIronBankData({ userAddress }: { userAddress: string | undefined }): Promise<any> {
    const yearn = this.yearnSdk;
    const ironBank = await yearn.ironBank.getIronBank(userAddress);

    return {
      address: ironBank.address,
      borrowLimit: ironBank.userAssetMetadata.borrowLimit.toString(),
      borrowLimitUsed: ironBank.userAssetMetadata.borrowLimitUSed.toString(),
    };
  }

  public async getSupportedCyTokens(): Promise<CyTokenData[]> {
    const yearn = this.yearnSdk;
    const ironBank = await yearn.ironBank.get();
    const cyTokenData = ironBank.map((cyToken) => {
      return {
        // static
        address: cyToken.id,
        decimals: cyToken.metadata.decimals.toString(),
        name: cyToken.name,
        symbol: cyToken.metadata.symbol,
        underlyingTokenAddress: cyToken.token.id,
        // dynamic
        lendApy: cyToken.metadata.lendApy,
        borrowApy: cyToken.metadata.borrowApy,
        liquidity: cyToken.metadata.liquidity.toString(),
        collateralFactor: cyToken.metadata.collateralFactor,
        reserveFactor: cyToken.metadata.reserveFactor,
        isActive: cyToken.metadata.isActive,
        exchangeRate: cyToken.metadata.exchangeRate,
      };
    });
    return cyTokenData;
  }

  public async getUserCyTokensData({ userAddress }: { userAddress: string }): Promise<UserCyTokenData[]> {
    const yearn = this.yearnSdk;
    const ironBank = await yearn.ironBank.assetsPositionsOf(userAddress);
    const cyTokenData = ironBank.map(({ positions, metadata }) => {
      const lendPosition = positions[0];
      const borrowPosition = positions[1];
      return {
        address: metadata.assetId,
        suppliedBalance: lendPosition.underlyingTokenBalance.amount.toString(),
        suppliedBalanceUsdc: lendPosition.underlyingTokenBalance.amountUsdc.toString(),
        borrowedBalance: borrowPosition.underlyingTokenBalance.amount.toString(),
        borrowedBalanceUsdc: borrowPosition.underlyingTokenBalance.amountUsdc.toString(),
        allowancesMap: borrowPosition.assetAllowances.reduce((map, allowance) => {
          map[allowance.spender] = allowance.amount.toString();
          return map;
        }, {} as { [key: string]: string }),
        tokenPosition: {
          address: lendPosition.tokenId,
          balance: lendPosition.underlyingTokenBalance.amount.toString(),
          balanceUsdc: lendPosition.underlyingTokenBalance.amountUsdc.toString(),
          allowancesMap: lendPosition.tokenAllowances.reduce((map, allowance) => {
            map[allowance.spender] = allowance.amount.toString();
            return map;
          }, {} as { [key: string]: string }),
        },

        enteredMarket: metadata.enteredMarket,
        borrowLimit: metadata.borrowLimit.toString(),
      };
    });
    return cyTokenData;
  }
}
