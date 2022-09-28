import { BigNumberish, BigNumber, ContractFunction, PopulatedTransaction } from 'ethers';

import {
  YearnSdk,
  TransactionService,
  Web3Provider,
  Config,
  ExecuteTransactionProps,
  Address,
  EscrowService,
} from '@types';
import { getConfig } from '@config';
import { getContract } from '@frameworks/ethers';

import { TransactionResponse } from '../types';

import { EscrowABI } from './contracts';

export class EscrowServiceImpl implements EscrowService {
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
    this.abi = EscrowABI;
    this.contractAddress = contractAddress;
    this.contract = getContract(contractAddress, EscrowABI, this.web3Provider.getSigner().provider);
  }

  public async addCollateral(
    amount: BigNumber,
    token: Address,
    dryRun: boolean
  ): Promise<TransactionResponse | PopulatedTransaction> {
    return await this.executeContractMethod('addCollateral', [amount, token], dryRun);
  }

  public async enableCollateral(
    amount: BigNumber,
    token: Address,
    dryRun: boolean
  ): Promise<TransactionResponse | PopulatedTransaction> {
    return await this.executeContractMethod('enableCollateral', [amount, token], dryRun);
  }

  public async liquidate(
    amount: BigNumber,
    targetToken: Address,
    to: Address,
    dryRun: boolean
  ): Promise<TransactionResponse | PopulatedTransaction> {
    return await this.executeContractMethod('liquidate', [amount, targetToken, to], dryRun);
  }

  public async releaseCollateral(
    amount: BigNumber,
    token: Address,
    to: Address,
    dryRun: boolean
  ): Promise<TransactionResponse | PopulatedTransaction> {
    return await this.executeContractMethod('releaseCollateral', [amount, token, to], dryRun);
  }

  private async getSignerAddress(): Promise<Address> {
    return await this.web3Provider.getSigner().getAddress();
  }

  public async isBorrower(): Promise<boolean> {
    return (await this.getSignerAddress()) === (await this.contract.borrower());
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
          props?.contractAddress
        }], error = [${JSON.stringify(e)}]`
      );
      return Promise.reject(e);
    }
  }
}
