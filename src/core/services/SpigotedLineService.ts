import { BytesLike } from '@ethersproject/bytes/src.ts';
import { ContractFunction, BigNumber, PopulatedTransaction } from 'ethers';

import {
  YearnSdk,
  TransactionService,
  Web3Provider,
  Config,
  ExecuteTransactionProps,
  Address,
  ISpigotSetting,
  SpigotedLineService,
} from '@types';
import { getConfig } from '@config';
import { getContract } from '@frameworks/ethers';

import { TransactionResponse } from '../types';

import { SpigotedLineABI } from './contracts';

export class SpigotedLineServiceImpl implements SpigotedLineService {
  private graphUrl: string;
  private web3Provider: Web3Provider;
  private transactionService: TransactionService;
  private config: Config;
  private readonly abi: Array<any>;
  private readonly contract: ContractFunction | any;
  private readonly contractAddress: Address;

  constructor({
    transactionService,
    yearnSdk,
    web3Provider,
    config,
    contractAddress,
  }: {
    transactionService: TransactionService;
    web3Provider: Web3Provider;
    yearnSdk: YearnSdk;
    config: Config;
    contractAddress: Address;
  }) {
    this.transactionService = transactionService;
    this.web3Provider = web3Provider;
    this.config = config;
    const { GRAPH_API_URL } = getConfig();
    this.graphUrl = GRAPH_API_URL || 'https://api.thegraph.com';
    this.abi = SpigotedLineABI;
    this.contractAddress = contractAddress;
    this.contract = getContract(contractAddress, SpigotedLineABI, this.web3Provider.getSigner().provider);
  }

  public async claimAndTrade(
    claimToken: Address,
    zeroExTradeData: BytesLike,
    dryRun: boolean
  ): Promise<TransactionResponse | PopulatedTransaction> {
    return await this.executeContractMethod('claimAndTrade', [claimToken, zeroExTradeData], dryRun);
  }

  public async claimAndRepay(
    claimToken: Address,
    calldata: BytesLike,
    dryRun: boolean
  ): Promise<TransactionResponse | PopulatedTransaction> {
    return await this.executeContractMethod('claimAndRepay', [claimToken, calldata], dryRun);
  }

  public async addSpigot(
    revenueContract: Address,
    setting: ISpigotSetting,
    dryRun: boolean
  ): Promise<TransactionResponse | PopulatedTransaction> {
    return await this.executeContractMethod('addSpigot', [revenueContract, setting], dryRun);
  }

  public async releaseSpigot(
    spigot: Address,
    status: string,
    borrower: Address,
    arbiter: Address,
    dryRun: boolean
  ): Promise<TransactionResponse | PopulatedTransaction> {
    return await this.executeContractMethod('releaseSpigot', [spigot, status, borrower, arbiter], dryRun);
  }

  private async getSignerAddress(): Promise<Address> {
    return await this.web3Provider.getSigner().getAddress();
  }

  public async borrower(): Promise<Address> {
    return await this.contract.borrower();
  }

  public async isBorrowing(): Promise<boolean> {
    const id = await this.contract.ids(0);
    return (await this.contract.count()) !== 0 && (await this.contract.credits(id)).principal !== 0;
  }

  public async isBorrower(): Promise<boolean> {
    return (await this.getSignerAddress()) === (await this.contract.borrower());
  }

  public async isOwner(): Promise<boolean> {
    return (await this.getSignerAddress()) === (await this.contract.owner());
  }

  public async maxSplit(): Promise<BigNumber> {
    return await this.contract.MAX_SPLIT();
  }

  public async getFirstID(): Promise<BytesLike> {
    return await this.contract.ids(0);
  }

  public async isSignerBorrowerOrLender(id: BytesLike): Promise<boolean> {
    const signer = await this.getSignerAddress();
    const credit = await this.contract.credits(id);
    return signer === credit.lender || signer === (await this.contract.borrower());
  }

  public async sweep(
    to: Address,
    token: Address,
    amount: BigNumber,
    status: string,
    borrower: Address,
    arbiter: Address,
    dryRun: boolean
  ): Promise<TransactionResponse | PopulatedTransaction> {
    return await this.executeContractMethod('sweep', [to, token, amount, status, borrower, arbiter], dryRun);
  }

  private async executeContractMethod(methodName: string, params: any[], dryRun: boolean) {
    let props: ExecuteTransactionProps | undefined = undefined;
    try {
      props = {
        network: 'mainnet',
        args: params,
        methodName: methodName,
        abi: this.abi,
        contractAddress: this.contractAddress,
      };
      if (dryRun) {
        return await this.transactionService.populateTransaction(props);
      }

      let tx;
      tx = await this.transactionService.execute(props);
      await tx.wait();
      return tx;
    } catch (e) {
      console.log(
        `An error occured while ${methodName} with params [${params}] on SpigotedLine [${
          this.contractAddress
        }], error = [${JSON.stringify(e)}]`
      );
      return Promise.reject(e);
    }
  }
}
