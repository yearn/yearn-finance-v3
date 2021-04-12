import { TokenService, TokenData, YearnSdk } from '@types';

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
      icon: 'MOCK', // TODO DEHARDCODE waiting for SDK TO ADD PROPERTY
    }));

    return tokensData;
  }
}
