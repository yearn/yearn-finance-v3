import { BigNumber, ContractFunction, PopulatedTransaction, ethers } from 'ethers';

import { TransactionService, Web3Provider, Config, ExecuteTransactionProps, Address, Network } from '@types';
import { getConfig } from '@config';

import { TransactionResponse } from '../types';

import { LineFactoryABI } from './contracts';

const { Arbiter_GOERLI, Oracle_GOERLI, SwapTarget_GOERLI, LineFactory_GOERLI, KibaSero_oracle } = getConfig();

export class LineFactoryServiceImpl {
  private graphUrl: string;
  private web3Provider: Web3Provider;
  private transactionService: TransactionService;
  private config: Config;
  private readonly abi: Array<any>;
  private readonly contract: ContractFunction | any;

  constructor({
    transactionService,
    web3Provider,
    config,
  }: {
    transactionService: TransactionService;
    web3Provider: Web3Provider;
    config: Config;
    contractAddress: Address;
  }) {
    this.transactionService = transactionService;
    this.web3Provider = web3Provider;
    this.config = config;
    const { GRAPH_API_URL } = getConfig();
    this.graphUrl = GRAPH_API_URL || 'https://api.thegraph.com';
    this.abi = LineFactoryABI;
  }

  public async deploySpigot(
    contractAddress: Address,
    owner: string,
    borrower: string,
    operator: string,
    dryRun: boolean
  ): Promise<TransactionResponse | PopulatedTransaction> {
    return await this.executeContractMethod(
      contractAddress,
      'deploySpigot',
      [owner, borrower, operator],
      'goerli',
      dryRun
    );
  }

  public async deployEscrow(
    contractAddress: Address,
    minCRatio: BigNumber,
    oracle: string,
    owner: string,
    borrower: string,
    dryRun: boolean
  ): Promise<TransactionResponse | PopulatedTransaction> {
    return await this.executeContractMethod(
      contractAddress,
      'deployEscrow',
      [minCRatio, oracle, owner, borrower],
      'goerli',
      dryRun
    );
  }

  public async deploySecuredLine(props: {
    borrower: string;
    ttl: number;
    network: Network;
  }): Promise<ethers.providers.TransactionResponse | PopulatedTransaction> {
    const { borrower, ttl } = props;
    const data = {
      borrower,
      ttl,
      arbiter: Arbiter_GOERLI,
      oracle: KibaSero_oracle,
      factoryAddress: LineFactory_GOERLI,
      swapTarget: SwapTarget_GOERLI,
    };
    console.log(data);
    return <TransactionResponse>(
      await this.executeContractMethod(
        data.factoryAddress,
        'deploySecuredLine',
        [data.oracle, data.arbiter, data.borrower, data.ttl, data.swapTarget],
        props.network,
        true
      )
    );
  }

  public async deploySecuredLineWtihConfig(
    contractAddress: Address,
    oracle: string,
    arbiter: string,
    borrower: string,
    ttl: BigNumber,
    revenueSplit: BigNumber,
    cratio: BigNumber,
    swapTarget: string,
    dryRun: boolean
  ): Promise<TransactionResponse | PopulatedTransaction> {
    return await this.executeContractMethod(
      contractAddress,
      'deploySecuredLineWithConfig',
      [oracle, arbiter, borrower, ttl, revenueSplit, cratio, swapTarget],
      'goerli',
      dryRun
    );
  }

  public async rolloverSecuredLine(
    contractAddress: Address,
    oldLine: string,
    borrower: string,
    oracle: string,
    arbiter: string,
    ttl: BigNumber,
    dryRun: boolean
  ): Promise<TransactionResponse | PopulatedTransaction> {
    return await this.executeContractMethod(
      contractAddress,
      'rolloverSecuredLine',
      [oldLine, borrower, oracle, arbiter, ttl],
      'goerli',
      dryRun
    );
  }

  private async executeContractMethod(
    contractAddress: string,
    methodName: string,
    params: any[],
    network: Network,
    dryRun: boolean
  ) {
    let props: ExecuteTransactionProps | undefined = undefined;
    try {
      props = {
        network: network,
        args: params,
        methodName: methodName,
        abi: this.abi,
        contractAddress: contractAddress,
      };

      let tx;
      tx = await this.transactionService.execute(props);
      await tx.wait();
      return tx;
    } catch (e) {
      console.log(
        `An error occured while ${methodName} with params [${params}] on FactoryLine [${props?.contractAddress}], error = [${e}]`
      );
      return Promise.reject(e);
    }
  }
}
