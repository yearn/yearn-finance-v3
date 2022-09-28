import { BigNumber, ethers, PopulatedTransaction, ContractFunction } from 'ethers';
import { BytesLike } from '@ethersproject/bytes/src.ts';
import { keccak256 } from 'ethers/lib/utils';

import {
  InterestRateCreditService,
  YearnSdk,
  TransactionService,
  Web3Provider,
  Config,
  InterestRateAccrueInterestProps,
  Address,
  TransactionResponse,
  STATUS,
  ExecuteTransactionProps,
} from '@types';
import { getConfig } from '@config';
import { InterestRateCreditABI } from '@services/contracts';
import { getContract } from '@frameworks/ethers';

export class InterestRateCreditServiceImpl implements InterestRateCreditService {
  private web3Provider: Web3Provider;
  private transactionService: TransactionService;
  private config: Config;
  private readonly abi: any;
  private readonly contract: ContractFunction | any;

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
    this.abi = InterestRateCreditABI;
    this.contract = getContract(contractAddress, this.abi, this.web3Provider.getSigner().provider);
  }

  public async accrueInterest(props: InterestRateAccrueInterestProps): Promise<BigNumber> {
    return await this.contract.accrueInterest(props.id, props.drawnBalance, props.facilityBalance);
  }
}
