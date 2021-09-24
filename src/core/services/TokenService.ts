import { unionBy } from 'lodash';

import {
  TokenService,
  YearnSdk,
  TokenDynamicData,
  ApproveProps,
  Web3Provider,
  Balance,
  Token,
  Integer,
  Config,
  Network,
  TransactionResponse,
  TransactionService,
  GetSupportedTokensProps,
  GetTokensDynamicDataProps,
  GetUserTokensDataProps,
  GetTokenAllowanceProps,
} from '@types';
import { getContract } from '@frameworks/ethers';
import { get, getUniqueAndCombine, toBN, USDC_DECIMALS } from '@utils';
import { getConfig } from '@config';
import erc20Abi from './contracts/erc20.json';

export class TokenServiceImpl implements TokenService {
  private transactionService: TransactionService;
  private yearnSdk: YearnSdk;
  private web3Provider: Web3Provider;
  private config: Config;

  constructor({
    transactionService,
    yearnSdk,
    web3Provider,
    config,
  }: {
    transactionService: TransactionService;
    web3Provider: Web3Provider;
    yearnSdk: YearnSdk;
    config: Config;
  }) {
    this.transactionService = transactionService;
    this.yearnSdk = yearnSdk;
    this.web3Provider = web3Provider;
    this.config = config;
  }

  public async getSupportedTokens({ network }: GetSupportedTokensProps): Promise<Token[]> {
    const yearn = this.yearnSdk.getInstanceOf(network);
    const [zapperTokens, vaultsTokens, ironBankTokens]: [Token[], Token[], Token[]] = await Promise.all([
      yearn.tokens.supported(),
      yearn.vaults.tokens(),
      yearn.ironBank.tokens(),
    ]);

    // We separated this because request is broken outside of this repo so we need to handle it separated
    // so we get the rest of the tokens.
    let labsTokens: Token[] = [];
    try {
      labsTokens = await this.getLabsTokens({ network });
    } catch (error) {
      console.log({ error });
    }

    const tokens = unionBy(vaultsTokens, ironBankTokens, 'address');
    tokens.push(...labsTokens);
    return getUniqueAndCombine(zapperTokens, tokens, 'address');
  }

  public async getTokensDynamicData({ network, addresses }: GetTokensDynamicDataProps): Promise<TokenDynamicData[]> {
    const yearn = this.yearnSdk.getInstanceOf(network);
    const pricesUsdcMap: any = yearn.tokens.priceUsdc(addresses);
    return addresses.map((address: string) => ({ address, priceUsdc: pricesUsdcMap[address] }));
  }

  public async getUserTokensData({
    network,
    accountAddress,
    tokenAddresses,
  }: GetUserTokensDataProps): Promise<Balance[]> {
    const { USE_MAINNET_FORK } = getConfig();
    const yearn = this.yearnSdk.getInstanceOf(network);
    const balances = await yearn.tokens.balances(accountAddress);
    if (USE_MAINNET_FORK) {
      return this.getBalancesForFork(balances, accountAddress);
    }
    return balances;
  }

  public async getTokenAllowance({
    network,
    accountAddress,
    tokenAddress,
    spenderAddress,
  }: GetTokenAllowanceProps): Promise<Integer> {
    // TODO use sdk when new method added.
    // const yearn = this.yearnSdk.getInstanceOf(network);
    // return await yearn.tokens.allowance(address);
    const signer = this.web3Provider.getSigner();
    const erc20Contract = getContract(tokenAddress, erc20Abi, signer);
    const allowance = await erc20Contract.allowance(accountAddress, spenderAddress);
    return allowance.toString();
  }

  public async approve(props: ApproveProps): Promise<TransactionResponse> {
    const { network, tokenAddress, spenderAddress, amount } = props;
    const signer = this.web3Provider.getSigner();
    const erc20Contract = getContract(tokenAddress, erc20Abi, signer);
    return await this.transactionService.execute({
      network,
      fn: erc20Contract.approve,
      args: [spenderAddress, amount],
    });
  }

  public async getLabsTokens({ network }: { network: Network }): Promise<Token[]> {
    const { NETWORK_SETTINGS } = this.config;
    if (!NETWORK_SETTINGS[network].labsEnabled) return [];
    return await Promise.all([this.getYvBoostToken(), this.getPSLPyvBoostEthToken()]);
  }

  private async getYvBoostToken(): Promise<Token> {
    const { YVBOOST } = getConfig().CONTRACT_ADDRESSES;
    const pricesResponse = await get('https://api.coingecko.com/api/v3/simple/price?ids=yvboost&vs_currencies=usd');
    const yvBoostPrice = pricesResponse.data['yvboost']['usd'];
    return {
      address: YVBOOST,
      decimals: '18',
      name: 'yvBOOST',
      priceUsdc: toBN(yvBoostPrice)
        .multipliedBy(10 ** USDC_DECIMALS)
        .toString(),
      supported: {
        zapper: false,
      },
      symbol: 'yvBOOST',
      icon: `https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/${YVBOOST}/logo-128.png`,
    };
  }

  private async getPSLPyvBoostEthToken(): Promise<Token> {
    const { ZAPPER_API_KEY } = this.config;
    const { PSLPYVBOOSTETH } = getConfig().CONTRACT_ADDRESSES;
    const pricesResponse = await get(
      `https://api.zapper.fi/v1/protocols/pickle/token-market-data?api_key=${ZAPPER_API_KEY}&type=vault`
    );
    const pJarPricePerToken = pricesResponse.data.find(
      ({ address }: { address: string }) => address === PSLPYVBOOSTETH.toLowerCase()
    )?.price;
    return {
      address: PSLPYVBOOSTETH,
      decimals: '18',
      name: 'pSLPyvBOOST-ETH',
      priceUsdc: toBN(pJarPricePerToken)
        .multipliedBy(10 ** USDC_DECIMALS)
        .toString(),
      supported: {
        zapper: false,
      },
      symbol: 'pSLPyvBOOST-ETH',
      icon: `https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/${PSLPYVBOOSTETH}/logo-128.png`,
    };
  }

  private async getBalancesForFork(balances: Balance[], userAddress: string): Promise<Balance[]> {
    const signer = this.web3Provider.getSigner();
    const provider = this.web3Provider.getInstanceOf('custom');

    const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
    const daiContract = getContract(DAI, erc20Abi, signer);
    const userDaiData = balances.find((balance) => balance.address === DAI);

    const YFI = '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e';
    const yfiContract = getContract(YFI, erc20Abi, signer);
    const userYfiData = balances.find((balance) => balance.address === YFI);

    const ETH = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
    const userEthData = balances.find((balance) => balance.address === ETH);

    const [daiBalance, ethBalance, yfiBalance] = await Promise.all([
      daiContract.balanceOf(userAddress),
      provider.getBalance(userAddress),
      yfiContract.balanceOf(userAddress),
    ]);

    const newBalances: Balance[] = [];

    if (userDaiData) {
      const newUserDaiData = {
        ...userDaiData,
        balance: daiBalance.toString(),
        balanceUsdc: toBN(userDaiData.priceUsdc)
          .times(daiBalance.toString())
          .div(10 ** parseInt(userDaiData.token.decimals))
          .toFixed(0),
      };
      newBalances.push(newUserDaiData);
    }

    if (userYfiData) {
      const newUserYfiData = {
        ...userYfiData,
        balance: yfiBalance.toString(),
        balanceUsdc: toBN(userYfiData.priceUsdc)
          .times(yfiBalance.toString())
          .div(10 ** parseInt(userYfiData.token.decimals))
          .toFixed(0),
      };
      newBalances.push(newUserYfiData);
    }

    if (userEthData) {
      const newUserEthData = {
        ...userEthData,
        balance: ethBalance.toString(),
        balanceUsdc: toBN(userEthData.priceUsdc)
          .times(ethBalance.toString())
          .div(10 ** parseInt(userEthData.token.decimals))
          .toFixed(0),
      };
      newBalances.push(newUserEthData);
    }

    return newBalances;
  }
}
