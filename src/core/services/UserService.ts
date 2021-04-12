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
      // vault.assetAllowances.forEach((allowance) => {
      //   allowancesMap[allowance.spender] = allowance.amount?.toString() ?? '0';
      // });
      const tokenAllowancesMap: any = {};
      // vault.tokenAllowances.forEach((allowance) => {
      //   tokenAllowancesMap[allowance.spender] = allowance.amount?.toString() ?? '0';
      // });

      return {
        address: vault.assetId.toLowerCase(),
        depositedBalance: vault.accountTokenBalance.amount.toString() ?? '0',
        depositedBalanceUsdc: vault.accountTokenBalance.amountUsdc.toString() ?? '0',
        allowancesMap: allowancesMap,
        tokenPosition: {
          address: vault.tokenId.toLowerCase(),
          balance: vault.underlyingTokenBalance.amount?.toString() ?? '0',
          balanceUsdc: vault.underlyingTokenBalance.amountUsdc?.toString() ?? '0',
          allowancesMap: tokenAllowancesMap,
        },
      };
    });

    return userVaultsData;
  }
}
