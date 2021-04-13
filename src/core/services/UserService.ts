import { Yearn } from '@yfi/sdk';

import { UserService, Web3Provider, UserVaultData, EthereumAddress } from '@types';

export class UserServiceImpl implements UserService {
  private web3Provider: Web3Provider;

  constructor({ web3Provider }: { web3Provider: Web3Provider }) {
    this.web3Provider = web3Provider;
  }

  public async getUserVaultsData({ userAddress }: { userAddress: EthereumAddress }): Promise<UserVaultData[]> {
    const provider = this.web3Provider.getInstanceOf('default');
    const yearn = new Yearn(1, { provider });
    const userVaults = await yearn.vaults.positionsOf(userAddress);
    const userVaultsData: UserVaultData[] = userVaults.map((vault) => {
      const allowancesMap: any = {};
      vault.allowances.forEach((allowance) => {
        allowancesMap[allowance.spender] = allowance.allowance.toString();
      });
      const tokenAllowancesMap: any = {};
      vault.tokenPosition.allowances.forEach((allowance) => {
        tokenAllowancesMap[allowance.spender] = allowance.allowance.toString();
      });

      return {
        address: vault.assetId,
        depositedBalance: vault.balance.toString(),
        depositedBalanceUsdc: vault.balanceUsdc.toString(),
        allowancesMap: allowancesMap,
        tokenPosition: {
          address: vault.tokenPosition.tokenId,
          balance: vault.tokenPosition.balance.toString(),
          balanceUsdc: vault.tokenPosition.balanceUsdc.toString(),
          allowancesMap: tokenAllowancesMap,
        },
      };
    });

    return userVaultsData;
  }
}
