import { Yearn } from '@yfi/sdk';
import { providers } from 'ethers';

import { getConfig } from '@config';
import { GetSupportedVaultsService, VaultData } from '@types';

export class GetSupportedVaults implements GetSupportedVaultsService {
  public async execute(): Promise<VaultData[]> {
    const { FANTOM_PROVIDER_HTTPS } = getConfig();
    const provider = new providers.JsonRpcProvider(FANTOM_PROVIDER_HTTPS);
    const yearn = new Yearn(250, provider);
    const vaults = await yearn.vaults.get();
    const vaultData: VaultData[] = vaults.map((vault) => ({
      address: vault.id,
      name: vault.name,
      version: vault.version,
      typeId: vault.typeId,
      balance: vault.balance?.toString() ?? '0',
      balanceUsdc: vault.balanceUsdc?.toString() ?? '0',
      token: vault.token.id,
      apyData: undefined,
    }));

    return vaultData;
  }
}
