import { notify } from '@frameworks/blocknative';
import { TokenService, YearnSdk, TokenDynamicData, ApproveProps, Web3Provider, Balance, Token, Integer } from '@types';
import { getContract } from '@frameworks/ethers';
import erc20Abi from './contracts/erc20.json';
import { unionBy } from 'lodash';
import { getConstants } from '../../config/constants';
import yvBoostAbi from './contracts/yvBoost.json';
import { JsonRpcProvider } from '@ethersproject/providers';
import { get, toBN, USDC_DECIMALS } from '../../utils';

export class TokenServiceImpl implements TokenService {
  private yearnSdk: YearnSdk;
  private web3Provider: Web3Provider;

  constructor({ yearnSdk, web3Provider }: { web3Provider: Web3Provider; yearnSdk: YearnSdk }) {
    this.yearnSdk = yearnSdk;
    this.web3Provider = web3Provider;
  }

  public async getSupportedTokens(): Promise<Token[]> {
    const yearn = this.yearnSdk;
    const [zapperTokens, vaultsTokens, ironBankTokens, yvBoostToken]: [
      Token[],
      Token[],
      Token[],
      Token
    ] = await Promise.all([
      yearn.tokens.supported(),
      yearn.vaults.tokens(),
      yearn.ironBank.tokens(),
      getYvBoostToken(this.web3Provider.getInstanceOf('default')),
    ]);

    const tokens = unionBy(vaultsTokens, ironBankTokens, 'address');
    tokens.push(yvBoostToken);
    return unionBy(zapperTokens, tokens, 'address');
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

  public async getTokenAllowance(
    accountAddress: string,
    tokenAddress: string,
    spenderAddress: string
  ): Promise<Integer> {
    // TODO use sdk when new method added.
    // const yearn = this.yearnSdk;
    // return await yearn.tokens.allowance(address);
    const signer = this.web3Provider.getSigner();
    const erc20Contract = getContract(tokenAddress, erc20Abi, signer);
    const allowance = await erc20Contract.allowance(accountAddress, spenderAddress);
    return allowance.toString();
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

async function getYvBoostToken(provider: JsonRpcProvider): Promise<Token> {
  // yvBoost
  const YVBOOST = getConstants().CONTRACT_ADDRESSES.YVBOOST;
  const yvBoostContract = getContract(YVBOOST, yvBoostAbi, provider);
  const [decimals, name, symbol, pricesResponse] = await Promise.all([
    yvBoostContract.decimals(),
    yvBoostContract.name(),
    yvBoostContract.symbol(),
    get('https://api.coingecko.com/api/v3/simple/price?ids=yvboost&vs_currencies=usd'),
  ]);
  const yvBoostPrice = pricesResponse.data['yvboost']['usd'];
  return {
    address: yvBoostContract.address,
    decimals: decimals.toString(),
    name,
    priceUsdc: toBN(yvBoostPrice)
      .multipliedBy(10 ** USDC_DECIMALS)
      .toString(),
    supported: {
      zapper: false,
    },
    symbol,
    icon:
      'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x9d409a0A012CFbA9B15F6D4B36Ac57A46966Ab9a/logo-128.png',
  };
}
