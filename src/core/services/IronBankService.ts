import { IronBankService, CyTokenData, CyTokenDynamicData, YearnSdk } from '@types';

export class IronBankServiceImpl implements IronBankService {
  private yearnSdk: YearnSdk;

  constructor({ yearnSdk }: { yearnSdk: YearnSdk }) {
    this.yearnSdk = yearnSdk;
  }

  public async getSupportedCyTokens(): Promise<CyTokenData[]> {
    throw new Error('IronBankServiceImpl.getSupportedCyTokens() not implemented');
  }

  public async getCyTokensDynamicData(): Promise<CyTokenDynamicData[]> {
    throw new Error('IronBankServiceImpl.getCyTokensDynamicData() not implemented');
  }
}
