import { Yearn } from '@yfi/sdk';

import { GetUserVaultsService, Web3Provider } from '@types';
import { UserVaultData } from '../types/UserVault';

export class GetUserVaults implements GetUserVaultsService {
  private web3Provider: Web3Provider;

  constructor({ web3Provider }: { web3Provider: Web3Provider }) {
    this.web3Provider = web3Provider;
  }

  public async execute(userAddress: string): Promise<UserVaultData[]> {
    const provider = this.web3Provider.getInstanceOf('fantom');
    const yearn = new Yearn(250, provider);
    const userVaults = await yearn.vaults.getPositionsOf(userAddress);
    const userVaultsData: UserVaultData[] = userVaults.map((vault) => {
      const allowancesMap: any = {};
      // TODO use commented code when 'allowances' property is added to SDK.
      // vault.allowances.forEach((allowance: any) => {
      //   allowancesMap[allowance.spender] = allowance.allowance?.toString() ?? '0';
      // });
      const tokenAllowancesMap: any = {};
      vault.tokenPosition.allowances.forEach((allowance: any) => {
        tokenAllowancesMap[allowance.spender] = allowance.allowance?.toString() ?? '0';
      });

      return {
        address: vault.assetId,
        depositedBalance: vault.balance?.toString() ?? '0',
        depositedBalanceUsdc: vault.balanceUsdc?.toString() ?? '0',
        allowancesMap: allowancesMap,
        tokenPosition: {
          address: vault.tokenPosition.tokenId,
          balance: vault.tokenPosition.balance?.toString() ?? '0',
          balanceUsdc: vault.tokenPosition.balanceUsdc?.toString() ?? '0',
          allowancesMap: tokenAllowancesMap,
        },
      };
    });

    return userVaultsData;
  }
}
