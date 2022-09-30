import { BytesLike } from '@ethersproject/bytes/src.ts';
import { BigNumber, PopulatedTransaction } from 'ethers';

import {
  YearnSdk,
  TransactionService,
  Web3Provider,
  Config,
  ExecuteTransactionProps,
  Address,
  ISpigotSetting,
  SpigotedLineService,
  CreditLineService,
} from '@types';
import { getConfig } from '@config';
import { getContract } from '@frameworks/ethers';

import { TransactionResponse } from '../types';

import { SpigotedLineABI } from './contracts';

export class SpigotedLineServiceImpl implements SpigotedLineService {
  private graphUrl: string;
  private web3Provider: Web3Provider;
  private transactionService: TransactionService;
  private creditLineService: CreditLineService;
  private config: Config;
  private readonly abi: Array<any>;

  constructor({
    transactionService,
    creditLineService,
    yearnSdk,
    web3Provider,
    config,
  }: {
    transactionService: TransactionService;
    web3Provider: Web3Provider;
    yearnSdk: YearnSdk;
    config: Config;
    creditLineService: CreditLineService;
  }) {
    this.transactionService = transactionService;
    this.creditLineService = creditLineService;
    this.web3Provider = web3Provider;
    this.config = config;
    const { GRAPH_API_URL } = getConfig();
    this.graphUrl = GRAPH_API_URL || 'https://api.thegraph.com';
    this.abi = SpigotedLineABI;
  }

  private _getContract(contractAddress: string) {
    return getContract(contractAddress.toString(), SpigotedLineABI, this.web3Provider.getSigner().provider);
  }

  public async claimAndTrade(
    lineAddress: Address,
    claimToken: Address,
    zeroExTradeData: BytesLike,
    dryRun: boolean
  ): Promise<TransactionResponse | PopulatedTransaction> {
    return await this.executeContractMethod(lineAddress, 'claimAndTrade', [claimToken, zeroExTradeData], dryRun);
  }

  public async claimAndRepay(
    lineAddress: Address,
    claimToken: Address,
    calldata: BytesLike,
    dryRun: boolean
  ): Promise<TransactionResponse | PopulatedTransaction> {
    return await this.executeContractMethod(lineAddress, 'claimAndRepay', [claimToken, calldata], dryRun);
  }

  public async addSpigot(
    lineAddress: Address,
    revenueContract: Address,
    setting: ISpigotSetting,
    dryRun: boolean
  ): Promise<TransactionResponse | PopulatedTransaction> {
    return await this.executeContractMethod(lineAddress, 'addSpigot', [revenueContract, setting], dryRun);
  }

  public async releaseSpigot(
    lineAddress: Address,
    spigot: Address,
    status: string,
    borrower: Address,
    arbiter: Address,
    dryRun: boolean
  ): Promise<TransactionResponse | PopulatedTransaction> {
    return await this.executeContractMethod(lineAddress, 'releaseSpigot', [spigot, status, borrower, arbiter], dryRun);
  }

  private async getSignerAddress(): Promise<Address> {
    return await this.web3Provider.getSigner().getAddress();
  }

  public async borrower(lineAddress: string): Promise<Address> {
    return await this.creditLineService.borrower(lineAddress);
  }

  public async isBorrowing(lineAddress: string): Promise<boolean> {
    const id = await this.creditLineService.getFirstID(lineAddress);
    return (
      (await this._getContract(lineAddress).count()) !== 0 &&
      (await this.creditLineService.getCredit(lineAddress, id)).principal.gt(0)
    );
  }

  public async isBorrower(lineAddress: string): Promise<boolean> {
    return (await this.getSignerAddress()) === (await this.borrower(lineAddress));
  }

  public async isOwner(lineAddress: string): Promise<boolean> {
    return (await this.getSignerAddress()) === (await this._getContract(lineAddress).owner());
  }

  public async maxSplit(lineAddress: string): Promise<BigNumber> {
    return await this._getContract(lineAddress).MAX_SPLIT();
  }

  public async getFirstID(lineAddress: string): Promise<BytesLike> {
    return await this.creditLineService.getFirstID(lineAddress);
  }

  public async isSignerBorrowerOrLender(lineAddress: string, id: BytesLike): Promise<boolean> {
    const signer = await this.getSignerAddress();
    const credit = await this.creditLineService.getCredit(lineAddress, id);
    return signer === credit.lender || signer === (await this.borrower(lineAddress));
  }

  public async sweep(
    lineAddress: string,
    to: Address,
    token: Address,
    amount: BigNumber,
    status: string,
    borrower: Address,
    arbiter: Address,
    dryRun: boolean
  ): Promise<TransactionResponse | PopulatedTransaction> {
    return await this.executeContractMethod(
      lineAddress,
      'sweep',
      [to, token, amount, status, borrower, arbiter],
      dryRun
    );
  }

  private async executeContractMethod(lineAddress: string, methodName: string, params: any[], dryRun: boolean) {
    let props: ExecuteTransactionProps | undefined = undefined;
    try {
      props = {
        network: 'goerli',
        args: params,
        methodName: methodName,
        abi: this.abi,
        contractAddress: lineAddress,
      };
      if (dryRun) {
        return await this.transactionService.populateTransaction(props);
      }

      const tx = await this.transactionService.execute(props);
      await tx.wait();
      return tx;
    } catch (e) {
      console.log(
        `An error occured while ${methodName} with params [${params}] on SpigotedLine [${lineAddress}], error = [${JSON.stringify(
          e
        )}]`
      );
      return Promise.reject(e);
    }
  }
}
