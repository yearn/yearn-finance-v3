import { getContract } from '@frameworks/ethers';
import {
  IronBankService,
  YearnSdk,
  IronBankMarket,
  Position,
  IronBankUserSummary,
  IronBankMarketDynamic,
  CyTokenUserMetadata,
  EnterOrExitMarketProps,
  IronBankGenericGetUserDataProps,
  IronBankTransactionProps,
  TransactionResponse,
  TransactionService,
  Web3Provider,
  Config,
  GetUserIronBankSummaryProps,
  GetSupportedMarketsProps,
  GetMarketDynamicDataProps,
} from '@types';
import { toBN } from '@utils';

import ironBankMarketAbi from './contracts/ironBankMarket.json';
import ironBankComptrollerAbi from './contracts/ironBankComptroller.json';

export class IronBankServiceImpl implements IronBankService {
  private transactionService: TransactionService;
  private yearnSdk: YearnSdk;
  private web3Provider: Web3Provider;
  private config: Config;

  constructor({
    transactionService,
    web3Provider,
    yearnSdk,
    config,
  }: {
    transactionService: TransactionService;
    web3Provider: Web3Provider;
    yearnSdk: YearnSdk;
    config: Config;
  }) {
    this.transactionService = transactionService;
    this.web3Provider = web3Provider;
    this.yearnSdk = yearnSdk;
    this.config = config;
  }

  public async getUserIronBankSummary({
    network,
    userAddress,
  }: GetUserIronBankSummaryProps): Promise<IronBankUserSummary> {
    const yearn = this.yearnSdk.getInstanceOf(network);
    return await yearn.ironBank.summaryOf(userAddress);
  }

  public async getSupportedMarkets({ network }: GetSupportedMarketsProps): Promise<IronBankMarket[]> {
    const yearn = this.yearnSdk.getInstanceOf(network);
    let markets = await yearn.ironBank.get();
    /* -------------------------------------------------------------------------- */
    // TODO: Remove this workaraund once SDK is updated to a new redeployed Lens contract that fixes APY calcs
    if (network === 'mainnet') {
      const marketsPromise = markets.map(async (market) => {
        const provider = this.web3Provider.getInstanceOf('ethereum');
        const ironBankMarketContract = getContract(market.address, ironBankMarketAbi, provider);
        const blocksPerYear = 2300000;
        const supplyRatePerBlock = await ironBankMarketContract.supplyRatePerBlock();
        const borrowRatePerBlock = await ironBankMarketContract.borrowRatePerBlock();
        const lendApyBips = toBN(supplyRatePerBlock.toString()).times(blocksPerYear).div(toBN(10).pow(14)).toString();
        const borrowApyBips = toBN(borrowRatePerBlock.toString()).times(blocksPerYear).div(toBN(10).pow(14)).toString();
        return {
          ...market,
          metadata: {
            ...market.metadata,
            lendApyBips,
            borrowApyBips,
          },
        };
      });
      markets = await Promise.all(marketsPromise);
    }
    /* -------------------------------------------------------------------------- */
    return markets;
  }

  public async getMarketsDynamicData({
    network,
    marketAddresses,
  }: GetMarketDynamicDataProps): Promise<IronBankMarketDynamic[]> {
    const yearn = this.yearnSdk.getInstanceOf(network);
    return await yearn.ironBank.getDynamic(marketAddresses);
  }

  public async getUserMarketsPositions({
    network,
    userAddress,
    marketAddresses,
  }: IronBankGenericGetUserDataProps): Promise<Position[]> {
    const yearn = this.yearnSdk.getInstanceOf(network);
    return await yearn.ironBank.positionsOf(userAddress, marketAddresses);
  }

  public async getUserMarketsMetadata({
    network,
    userAddress,
    marketAddresses,
  }: IronBankGenericGetUserDataProps): Promise<CyTokenUserMetadata[]> {
    const yearn = this.yearnSdk.getInstanceOf(network);
    return await yearn.ironBank.metadataOf(userAddress, marketAddresses);
  }

  public async executeTransaction({
    network,
    userAddress,
    marketAddress,
    amount,
    action,
  }: IronBankTransactionProps): Promise<TransactionResponse> {
    const { MAX_UINT256 } = this.config;
    const provider = this.web3Provider.getSigner();
    const ironBankMarketContract = getContract(marketAddress, ironBankMarketAbi, provider);
    switch (action) {
      case 'supply':
        return await this.transactionService.execute({
          network,
          methodName: 'mint',
          abi: ironBankMarketAbi,
          contractAddress: marketAddress,
          args: [amount],
        });
      case 'withdraw':
        if (amount === MAX_UINT256) {
          const balanceOf = await ironBankMarketContract.balanceOf(userAddress);
          return await this.transactionService.execute({
            network,
            methodName: 'redeem',
            abi: ironBankMarketAbi,
            contractAddress: marketAddress,
            args: [balanceOf.toString()],
          });
        } else {
          return await this.transactionService.execute({
            network,
            methodName: 'redeemUnderlying',
            abi: ironBankMarketAbi,
            contractAddress: marketAddress,
            args: [amount],
          });
        }
      case 'borrow':
        return await this.transactionService.execute({
          network,
          methodName: 'borrow',
          abi: ironBankMarketAbi,
          contractAddress: marketAddress,
          args: [amount],
        });
      case 'repay':
        return await this.transactionService.execute({
          network,
          methodName: 'repayBorrow',
          abi: ironBankMarketAbi,
          contractAddress: marketAddress,
          args: [amount],
        });
    }
  }

  public async enterOrExitMarket({
    network,
    marketAddress,
    actionType,
  }: EnterOrExitMarketProps): Promise<TransactionResponse> {
    const { CONTRACT_ADDRESSES } = this.config;
    const { ironBankComptroller, ironBankComptrollerFantom, ironBankComptrollerArbitrum } = CONTRACT_ADDRESSES;
    let comptrollerAddress: string;
    if (network === 'fantom') {
      comptrollerAddress = ironBankComptrollerFantom;
    } else if (network === 'arbitrum') {
      comptrollerAddress = ironBankComptrollerArbitrum;
    } else {
      comptrollerAddress = ironBankComptroller;
    }
    switch (actionType) {
      case 'enterMarket':
        return await this.transactionService.execute({
          network,
          methodName: 'enterMarkets',
          abi: ironBankComptrollerAbi,
          contractAddress: comptrollerAddress,
          args: [[marketAddress]],
        });

      case 'exitMarket':
        return await this.transactionService.execute({
          network,
          methodName: 'exitMarket',
          abi: ironBankComptrollerAbi,
          contractAddress: comptrollerAddress,
          args: [marketAddress],
        });
    }
  }
}
