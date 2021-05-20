import { notify } from '@frameworks/blocknative';
import { TokenService, YearnSdk, TokenDynamicData, ApproveProps, Web3Provider, Balance, Token } from '@types';
import { getContract } from '@frameworks/ethers';
import erc20Abi from './contracts/erc20.json';
import { unionBy } from 'lodash';

export class TokenServiceImpl implements TokenService {
  private yearnSdk: YearnSdk;
  private web3Provider: Web3Provider;

  constructor({ yearnSdk, web3Provider }: { web3Provider: Web3Provider; yearnSdk: YearnSdk }) {
    this.yearnSdk = yearnSdk;
    this.web3Provider = web3Provider;
  }

  public async getSupportedTokens(): Promise<Token[]> {
    const yearn = this.yearnSdk;
    const [zapperTokens, vaultsTokens]: [Token[], Token[]] = await Promise.all([
      yearn.tokens.supported(),
      yearn.vaults.tokens(),
    ]);
    return unionBy(zapperTokens, vaultsTokens, 'address');
  }

  public async getTokensDynamicData(addresses: string[]): Promise<TokenDynamicData[]> {
    const yearn = this.yearnSdk;
    const pricesUsdcMap: any = yearn.tokens.priceUsdc(addresses);
    return addresses.map((address: string) => ({ address, priceUsdc: pricesUsdcMap[address] }));
  }

  public async getUserTokensData(address: string, tokenAddresses?: string[]): Promise<Balance[]> {
    const yearn = this.yearnSdk;
    return await yearn.tokens.balances(address);
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
