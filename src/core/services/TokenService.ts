import { TokenService, TokenData, YearnSdk, TokenDynamicData } from '@types';

export class TokenServiceImpl implements TokenService {
  private yearnSdk: YearnSdk;

  constructor({ yearnSdk }: { yearnSdk: YearnSdk }) {
    this.yearnSdk = yearnSdk;
  }

  public async getSupportedTokens(): Promise<TokenData[]> {
    const yearn = this.yearnSdk;
    const tokens = await yearn.tokens.supported();
    const tokensData: TokenData[] = tokens.map((token) => ({
      address: token.id.toLowerCase(),
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals.toString(),
      icon: 'MOCK', // TODO DEHARDCODE waiting for SDK TO ADD PROPERTY,
      priceUsdc: '0', // TODO DEHARDCODE when implementing sdk and mock service.
    }));

    return tokensData;
  }

  public async getTokensDynamicData(addresses: string[]): Promise<TokenDynamicData[]> {
    const yearn = this.yearnSdk;
    // TODO remove when implementing sdk and mock service.
    const mockDynamicData = {
      id: '0x000',
      priceUsdc: '0',
    };
    // const tokens = await yearn.tokens.dynamicData(addresses);
    const tokens = [mockDynamicData];
    const tokensDynamicData: TokenDynamicData[] = tokens.map((token) => ({
      address: token.id.toLowerCase(),
      priceUsdc: '0',
    }));

    return tokensDynamicData;
  }
}
