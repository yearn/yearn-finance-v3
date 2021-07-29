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
  Web3Provider,
  Config,
} from '@types';
import ironBankMarketAbi from './contracts/ironBankMarket.json';
import ironBankComptrollerAbi from './contracts/ironBankComptroller.json';

export class IronBankServiceImpl implements IronBankService {
  private yearnSdk: YearnSdk;
  private web3Provider: Web3Provider;
  private config: Config;

  constructor({ web3Provider, yearnSdk, config }: { web3Provider: Web3Provider; yearnSdk: YearnSdk; config: Config }) {
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
    const provider = this.web3Provider.getSigner();
    const ironBankMarketContract = getContract(marketAddress, ironBankMarketAbi, provider);

    switch (action) {
      case 'supply':
        return await ironBankMarketContract.mint(amount);
      case 'withdraw':
        return await ironBankMarketContract.redeemUnderlying(amount);
      case 'borrow':
        return await ironBankMarketContract.borrow(amount);
      case 'repay':
        return await ironBankMarketContract.repayBorrow(amount);
    }
  }

  public async enterOrExitMarket({ marketAddress, actionType }: EnterOrExitMarketProps): Promise<TransactionResponse> {
    const { CONTRACT_ADDRESSES } = this.config;
    const { ironBankComptroller } = CONTRACT_ADDRESSES;
    const provider = this.web3Provider.getSigner();
    const ironBankComptrollerContract = getContract(ironBankComptroller, ironBankComptrollerAbi, provider);
    switch (actionType) {
      case 'enterMarket':
        return await ironBankComptrollerContract.enterMarkets([marketAddress]);

      case 'exitMarket':
        return await ironBankComptrollerContract.exitMarket(marketAddress);
    }
  }
}
