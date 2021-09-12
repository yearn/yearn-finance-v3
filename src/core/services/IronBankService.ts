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
} from '@types';
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

  public async getUserIronBankSummary({ userAddress }: { userAddress: string }): Promise<IronBankUserSummary> {
    const yearn = this.yearnSdk;
    return await yearn.ironBank.summaryOf(userAddress);
  }

  public async getSupportedMarkets(): Promise<IronBankMarket[]> {
    const yearn = this.yearnSdk;
    return await yearn.ironBank.get();
  }

  public async getMarketsDynamicData(marketAddresses: string[]): Promise<IronBankMarketDynamic[]> {
    const yearn = this.yearnSdk;
    return await yearn.ironBank.getDynamic(marketAddresses);
  }

  public async getUserMarketsPositions({
    userAddress,
    marketAddresses,
  }: IronBankGenericGetUserDataProps): Promise<Position[]> {
    const yearn = this.yearnSdk;
    return await yearn.ironBank.positionsOf(userAddress, marketAddresses);
  }

  public async getUserMarketsMetadata({
    userAddress,
    marketAddresses,
  }: IronBankGenericGetUserDataProps): Promise<CyTokenUserMetadata[]> {
    const yearn = this.yearnSdk;
    return await yearn.ironBank.metadataOf(userAddress, marketAddresses);
  }

  public async executeTransaction({
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
        return await this.transactionService.execute({ fn: ironBankMarketContract.mint, args: [amount] });
      case 'withdraw':
        if (amount === MAX_UINT256) {
          const balanceOf = await ironBankMarketContract.balanceOf(userAddress);
          return await this.transactionService.execute({
            fn: ironBankMarketContract.redeem,
            args: [balanceOf.toString()],
          });
        } else {
          return await this.transactionService.execute({ fn: ironBankMarketContract.redeemUnderlying, args: [amount] });
        }
      case 'borrow':
        return await this.transactionService.execute({ fn: ironBankMarketContract.borrow, args: [amount] });
      case 'repay':
        return await this.transactionService.execute({ fn: ironBankMarketContract.repayBorrow, args: [amount] });
    }
  }

  public async enterOrExitMarket({ marketAddress, actionType }: EnterOrExitMarketProps): Promise<TransactionResponse> {
    const { CONTRACT_ADDRESSES } = this.config;
    const { ironBankComptroller } = CONTRACT_ADDRESSES;
    const provider = this.web3Provider.getSigner();
    const ironBankComptrollerContract = getContract(ironBankComptroller, ironBankComptrollerAbi, provider);
    switch (actionType) {
      case 'enterMarket':
        return await this.transactionService.execute({
          fn: ironBankComptrollerContract.enterMarkets,
          args: [[marketAddress]],
        });

      case 'exitMarket':
        return await this.transactionService.execute({
          fn: ironBankComptrollerContract.exitMarket,
          args: [marketAddress],
        });
    }
  }
}
