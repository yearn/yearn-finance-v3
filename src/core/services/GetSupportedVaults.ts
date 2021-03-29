import { GetSupportedVaultsService, GetSupportedVaultsServiceResult, Wallet } from '@types';

export class GetSupportedVaults implements GetSupportedVaultsService {
  private wallet: Wallet;

  public constructor({ wallet }: { wallet: Wallet }) {
    this.wallet = wallet;
  }

  public async execute(): Promise<GetSupportedVaultsServiceResult[]> {
    console.log('Dependency Injection of wallet instance:', this.wallet.name);
    throw Error('GetSupportedVaults service not implemented');
  }
}
