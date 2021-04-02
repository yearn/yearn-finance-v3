import { Yearn, Metadata } from '@yfi/sdk';

import { GetSupportedVaultsService, VaultData, Web3Provider } from '@types';

export class GetSupportedVaults implements GetSupportedVaultsService {
  private web3Provider: Web3Provider;

  constructor({ web3Provider }: { web3Provider: Web3Provider }) {
    this.web3Provider = web3Provider;
  }

  public async execute(): Promise<VaultData[]> {
    const provider = this.web3Provider.getInstanceOf('fantom');
    const yearn = new Yearn(250, { provider });
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
      depositLimit: (vault.metadata as Metadata['VAULT_V2']).depositLimit?.toString() ?? '0',
    }));

    return vaultData;
  }
}
