import { notify } from '@frameworks/blocknative';
import { TokenService, TokenData, YearnSdk, TokenDynamicData, ApproveProps, Web3Provider } from '@types';
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
      address: token.id,
      priceUsdc: '0',
    }));

    return tokensDynamicData;
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
