import { notify } from '@frameworks/blocknative';
import { TokenService, YearnSdk, TokenDynamicData, ApproveProps, Web3Provider } from '@types';
import { getContract } from '@frameworks/ethers';
import erc20Abi from './contracts/erc20.json';
import { Balance, Token } from '@yfi/sdk';

export class TokenServiceImpl implements TokenService {
  private yearnSdk: YearnSdk;
  private web3Provider: Web3Provider;

  constructor({ yearnSdk, web3Provider }: { web3Provider: Web3Provider; yearnSdk: YearnSdk }) {
    this.yearnSdk = yearnSdk;
    this.web3Provider = web3Provider;
  }

  public async getSupportedTokens(): Promise<Token[]> {
    const yearn = this.yearnSdk;
    return await yearn.tokens.supported();
  }

  public async getTokensDynamicData(addresses: string[]): Promise<TokenDynamicData[]> {
    // TODO this should be refactored correctly when sdk implements the method to fetch more that one token prices at onces
    const yearn = this.yearnSdk;
    if (!addresses.length) {
      throw new Error('Need to provide addresses');
    }
    const pricesUsdc = await Promise.all(addresses.map((address: string) => yearn.tokens.priceUsdc(address)));
    return pricesUsdc.map((priceUsdc, i: number) => ({ address: addresses[i], priceUsdc }));
  }

  public async getUserTokensData(addresses?: string[]): Promise<Balance[]> {
    const yearn = this.yearnSdk;
    return await yearn.tokens.balances(addresses);
  }

  public async approve(props: ApproveProps): Promise<void> {
    const { tokenAddress, spenderAddress, amount } = props;
    const signer = this.web3Provider.getSigner();
    const erc20Contract = getContract(tokenAddress, erc20Abi, signer);
    const transaction = await erc20Contract.approve(spenderAddress, amount);
    console.log('Transaction: ', transaction);
    notify.hash(transaction.hash);
    const receipt = await transaction.wait(1);
    console.log('Receipt: ', receipt);
  }
}
