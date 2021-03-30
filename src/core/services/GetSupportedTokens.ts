import { Yearn } from '@yfi/sdk';

import { GetSupportedTokensService, TokenData, Web3Provider } from '@types';

export class GetSupportedTokens implements GetSupportedTokensService {
  private web3Provider: Web3Provider;

  constructor({ web3Provider }: { web3Provider: Web3Provider }) {
    this.web3Provider = web3Provider;
  }

  public async execute(): Promise<TokenData[]> {
    const provider = this.web3Provider.getInstanceOf('fantom');
    const yearn = new Yearn(250, provider);
    const tokens = await yearn.vaults.getTokens();
    const tokensData: TokenData[] = tokens.map((token) => ({
      address: token.id,
      name: token.name,
      symbol: token.symbol?.toString() ?? '0',
      decimals: token.decimals?.toString(),
      icon: 'MOCK', // TODO DEHARDCODE waiting for SDK TO ADD PROPERTY
    }));

    return tokensData;
  }
}
