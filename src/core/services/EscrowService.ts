import { BigNumber, PopulatedTransaction } from 'ethers';

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
    this.web3Provider = web3Provider;
    this.config = config;
    const { GRAPH_API_URL } = getConfig();
    this.graphUrl = GRAPH_API_URL || 'https://api.thegraph.com';
    this.abi = EscrowABI;
  }

  private _getContract(address: Address) {
    return getContract(address, EscrowABI, this.web3Provider.getSigner().provider);
  }

  public async addCollateral(contractAddress: string, amount: BigNumber, token: Address): Promise<string> {
    if (amount.lte(0)) {
      throw new Error('Cannot add collateral. Amount is 0 or less');
    }

    return (<TransactionResponse>await this.executeContractMethod(contractAddress, 'addCollateral', [amount, token]))
      .hash;
  }

  public async enableCollateral(
    contractAddress: string,
    amount: BigNumber,
    token: Address,
    dryRun: boolean
  ): Promise<TransactionResponse | PopulatedTransaction> {
    return await this.executeContractMethod(contractAddress, 'enableCollateral', [amount, token], dryRun);
  }

  public async liquidate(
    contractAddress: string,
    amount: BigNumber,
    targetToken: Address,
    to: Address,
    dryRun: boolean
  ): Promise<TransactionResponse | PopulatedTransaction> {
    return await this.executeContractMethod(contractAddress, 'liquidate', [amount, targetToken, to], dryRun);
  }

  public async releaseCollateral(
    contractAddress: string,
    amount: BigNumber,
    token: Address,
    to: Address
  ): Promise<string> {
    if (amount.lte(0)) {
      throw new Error('Cannot release collateral. Amount is 0 or less');
    }

    if (!(await this.isBorrower(contractAddress))) {
      throw new Error('Release collateral is not possible because signer is not borrower');
    }

    return (<TransactionResponse>(
      await this.executeContractMethod(contractAddress, 'releaseCollateral', [amount, token, to])
    )).hash;
  }

  private async getSignerAddress(contractAddress: string): Promise<Address> {
    return await this.web3Provider.getSigner().getAddress();
  }

  public async isBorrower(contractAddress: string): Promise<boolean> {
    return (await this.getSignerAddress(contractAddress)) === (await this._getContract(contractAddress).borrower());
  }

  private async executeContractMethod(
    contractAddress: string,
    methodName: string,
    params: any[],
    dryRun: boolean = false
  ) {
    let props: ExecuteTransactionProps | undefined = undefined;
    try {
      props = {
        network: 'mainnet',
        args: params,
        methodName: methodName,
        abi: this.abi,
        contractAddress: contractAddress,
      };
      if (dryRun) {
        return await this.transactionService.populateTransaction(props);
      }

      const tx = await this.transactionService.execute(props);
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
