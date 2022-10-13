import { BigNumber, ContractFunction } from 'ethers';

import {
  InterestRateCreditService,
  YearnSdk,
  TransactionService,
  Web3Provider,
  Config,
  InterestRateAccrueInterestProps,
  Address,
} from '@types';
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
  }: {
    transactionService: TransactionService;
    web3Provider: Web3Provider;
    yearnSdk: YearnSdk;
    config: Config;
  }) {
    this.transactionService = transactionService;
    this.web3Provider = web3Provider;
    this.config = config;
    this.abi = InterestRateCreditABI;
  }

  private _getContract(address: Address) {
    return getContract(address, this.abi, this.web3Provider.getSigner().provider);
  }

  public async accrueInterest(props: InterestRateAccrueInterestProps): Promise<BigNumber> {
    return await this._getContract(props.contractAddress).accrueInterest(
      props.id,
      props.drawnBalance,
      props.facilityBalance
    );
  }
}
