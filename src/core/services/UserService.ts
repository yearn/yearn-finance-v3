import { UserService, UserVaultData, EthereumAddress, YearnSdk } from '@types';

export class UserServiceImpl implements UserService {
  private yearnSdk: YearnSdk;

  constructor({ yearnSdk }: { yearnSdk: YearnSdk }) {
    this.yearnSdk = yearnSdk;
  }

  public async getUserVaultsData({ userAddress }: { userAddress: EthereumAddress }): Promise<UserVaultData[]> {
    const yearn = this.yearnSdk;
    const userVaults = await yearn.vaults.positionsOf(userAddress);
    const userVaultsData: UserVaultData[] = userVaults.map((vault) => {
      const allowancesMap: any = {};
      vault.assetAllowances.forEach((allowance) => {
        allowancesMap[allowance.spender] = allowance.amount.toString();
      });
      const tokenAllowancesMap: any = {};
      // TODO: uncomment when fixed on sdk. Correct name is 'tokenAllowances', current is 'allowances'.
      // vault.tokenAllowances.forEach((allowance) => {
      //   tokenAllowancesMap[allowance.spender] = allowance.amount.toString();
      // });

      return {
        address: vault.assetId.toLowerCase(),
        depositedBalance: vault.accountTokenBalance.amount.toString(),
        depositedBalanceUsdc: vault.accountTokenBalance.amountUsdc.toString(),
        allowancesMap: allowancesMap,
        tokenPosition: {
          address: vault.tokenId.toLowerCase(),
          balance: vault.underlyingTokenBalance.amount.toString(),
          balanceUsdc: vault.underlyingTokenBalance.amountUsdc.toString(),
          allowancesMap: tokenAllowancesMap,
        },
      };
    });

    return userVaultsData;
  }
}
