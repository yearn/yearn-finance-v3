import { Yearn } from '@yfi/sdk';

import { TokenService, TokenData, Web3Provider } from '@types';

export class TokenServiceImpl implements TokenService {
  private web3Provider: Web3Provider;

  constructor({ web3Provider }: { web3Provider: Web3Provider }) {
    this.web3Provider = web3Provider;
  }

  public async getSupportedTokens(): Promise<TokenData[]> {
    const provider = this.web3Provider.getInstanceOf('default');
    const yearn = new Yearn(1, { provider });
    const tokens = await yearn.vaults.tokens();
    const tokensData: TokenData[] = tokens.map((token) => ({
      address: token.id,
      name: token.name,
      symbol: token.symbol.toString(),
      decimals: token.decimals.toString(),
      icon: 'MOCK', // TODO DEHARDCODE waiting for SDK TO ADD PROPERTY
    }));

    return tokensData;
  }
}
