import { notify } from '@frameworks/blocknative';
import { TokenService, TokenData, YearnSdk, TokenDynamicData, ApproveProps, Web3Provider, UserTokenData } from '@types';
import { getContract } from '@frameworks/ethers';
import erc20Abi from './contracts/erc20.json';

export class TokenServiceImpl implements TokenService {
  private yearnSdk: YearnSdk;
  private web3Provider: Web3Provider;

  constructor({ yearnSdk, web3Provider }: { web3Provider: Web3Provider; yearnSdk: YearnSdk }) {
    this.yearnSdk = yearnSdk;
    this.web3Provider = web3Provider;
  }

  public async getSupportedTokens(): Promise<TokenData[]> {
    const yearn = this.yearnSdk;
    return await yearn.tokens.supported();
  }

  public async getTokensDynamicData(addresses?: string[]): Promise<TokenDynamicData[]> {
    const yearn = this.yearnSdk;
    return await yearn.tokens.tokensDynamicData(addresses);
  }

  public async getUserTokensData(addresses?: string[]): Promise<UserTokenData[]> {
    const yearn = this.yearnSdk;
    return await yearn.tokens.tokenPositionsOf(addresses);
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
