import { ContractFunction, ethers, PopulatedTransaction, utils } from 'ethers';
import { BytesLike } from '@ethersproject/bytes/src.ts';
import { keccak256 } from 'ethers/lib/utils';

import {
  LiquidateCreditProps,
  BorrowCreditProps,
  CreditLineService,
  AggregatedCreditLine,
  TransactionService,
  Web3Provider,
  Config,
  Address,
  TransactionResponse,
  STATUS,
  ExecuteTransactionProps,
  Credit,
  GetLineProps,
  GetLinesProps,
  GetLinePageProps,
  AddCreditProps,
  CloseProps,
  WithdrawLineProps,
  SetRatesProps,
  IncreaseCreditProps,
  DepositAndRepayProps,
  DepositAndCloseProps,
  GetLinesResponse,
  GetLinePageAuxDataProps,
  GetLinePageAuxDataResponse,
  InterestRateCreditService,
  GetLinePageResponse,
  Network,
  UserPositionMetadata,
} from '@types';
import { getConfig } from '@config';
import { LineOfCreditABI } from '@services/contracts';
import { getContract } from '@frameworks/ethers';
import { getLinePage, getLinePageAuxData, getLines } from '@frameworks/gql';
import { unnullify } from '@src/utils';

const { GRAPH_API_URL } = getConfig();

export class CreditLineServiceImpl implements CreditLineService {
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
  }) {
    this.transactionService = transactionService;
    this.web3Provider = web3Provider;
    this.config = config;

    this.graphUrl = GRAPH_API_URL || 'https://api.thegraph.com';
    this.abi = LineOfCreditABI;
  }

  private _getContract(contractAddress: string) {
    return getContract(contractAddress.toString(), LineOfCreditABI, this.web3Provider.getSigner().provider);
  }

  private async getSignerAddress(): Promise<Address> {
    return await this.web3Provider.getSigner().getAddress();
  }

  public async close(props: CloseProps): Promise<string> {
    try {
      if (!(await this.isSignerBorrowerOrLender(props.lineAddress, props.id))) {
        throw new Error('Unable to close. Signer is not borrower or lender');
      }
      return (<TransactionResponse>await this.executeContractMethod(props.lineAddress, 'close', [props.id], 'goerli'))
        .hash;
    } catch (e) {
      console.log(`An error occured while closing credit, error = [${JSON.stringify(e)}]`);
      return Promise.reject(e);
    }
  }

  public async withdraw(props: WithdrawLineProps): Promise<TransactionResponse | PopulatedTransaction> {
    try {
      if (!(await this.isLender(props.lineAddress, props.id))) {
        throw new Error('Cannot withdraw. Signer is not lender');
      }
      //@ts-ignore
      return (<TransactionResponse>(
        await this.executeContractMethod(props.lineAddress, 'withdraw', [props.id, props.amount], props.network)
      )).hash;
    } catch (e) {
      console.log(`An error occured while withdrawing credit, error = [${JSON.stringify(e)}]`);
      return Promise.reject(e);
    }
  }

  public async setRates(props: SetRatesProps): Promise<string> {
    try {
      const { lineAddress: line, id } = props;
      // check mutualConsentById
      const populatedTrx = await this.executeContractMethod(
        props.lineAddress,
        'setRates',
        [props.id, props.drate, props.frate],
        'goerli',
        true
      );
      const borrower = await this.borrower(line);
      const lender = await this.getLenderByCreditID(line, id);
      if (!(await this.isMutualConsent(line, populatedTrx.data, borrower, lender))) {
        throw new Error(
          `Setting rate is not possible. reason: "Consent has not been initialized by other party for the given creditLine [${props.lineAddress}]`
        );
      }
      //@ts-ignore
      return (<TransactionResponse>(
        await this.executeContractMethod(props.lineAddress, 'setRates', [props.id, props.drate, props.frate], 'goerli')
      )).hash;
    } catch (e) {
      console.log(`An error occured while setting rate, error = [${JSON.stringify(e)}]`);
      return Promise.reject(e);
    }
  }

  public async increaseCredit(props: IncreaseCreditProps): Promise<string> {
    try {
      const line = props.lineAddress;
      if (await this.isActive(line)) {
        throw new Error(`Increasing credit is not possible. reason: "The given creditLine [${line}] is not active"`);
      }

      // check mutualConsentById
      const populatedTrx = await this.executeContractMethod(
        props.lineAddress,
        'increaseCredit',
        [props.id, props.amount],
        'goerli',
        true
      );

      const borrower = await this.borrower(line);
      const lender = await this.getLenderByCreditID(line, props.id);
      if (!(await this.isMutualConsent(line, populatedTrx.data, borrower, lender))) {
        throw new Error(
          `Increasing credit is not possible. reason: "Consent has not been initialized by other party for the given creditLine [${props.lineAddress}]`
        );
      }
      //@ts-ignore
      return (<TransactionResponse>(
        await this.executeContractMethod(props.lineAddress, 'increaseCredit', [props.id, props.amount], 'goerli')
      )).hash;
    } catch (e) {
      console.log(`An error occured while increasing credit, error = [${JSON.stringify(e)}]`);
      return Promise.reject(e);
    }
  }

  public async depositAndRepay(
    props: DepositAndRepayProps,
    interest: InterestRateCreditService
  ): Promise<TransactionResponse | PopulatedTransaction> {
    try {
      if (!(await this.isBorrowing(props.lineAddress))) {
        throw new Error('Deposit and repay is not possible because not borrowing');
      }

      const id = await this.getFirstID(props.lineAddress);
      const credit = await this.getCredit(props.lineAddress, id);

      // check interest accrual
      // note: `accrueInterest` will not be called because it has a modifier that is expecting
      // line of credit to be the msg.sender. We should probably update that modifier since
      // it only does the calculation and doesn't change state.
      const calcAccrue = await interest.accrueInterest({
        contractAddress: await this.getInterestRateContract(props.lineAddress),
        id,
        drawnBalance: utils.parseUnits(credit.principal, 'ether'),
        facilityBalance: utils.parseUnits(credit.deposit, 'ether'),
      });
      const simulateAccrue = unnullify(credit.interestAccrued, true).add(calcAccrue);
      if (unnullify(props.amount, true).gt(unnullify(credit.principal, true).add(simulateAccrue))) {
        throw new Error('Amount is greater than (principal + interest to be accrued). Enter lower amount.');
      }
      //@ts-ignore
      return (<TransactionResponse>(
        await this.executeContractMethod(props.lineAddress, 'depositAndRepay', [props.amount], props.network)
      )).hash;
    } catch (e) {
      console.log(`An error occured while depositAndRepay credit, error = [${JSON.stringify(e)}]`);
      return Promise.reject(e);
    }
  }

  public async depositAndClose(props: DepositAndCloseProps): Promise<TransactionResponse | PopulatedTransaction> {
    try {
      if (!(await this.isBorrowing(props.lineAddress))) {
        throw new Error('Deposit and close is not possible because not borrowing');
      }
      if (!(await this.isBorrower(props.lineAddress))) {
        throw new Error('Deposit and close is not possible because signer is not borrower');
      }
      //@ts-ignore
      return (<TransactionResponse>(
        await this.executeContractMethod(props.lineAddress, 'depositAndClose', [], props.network)
      )).hash;
    } catch (e) {
      console.log(`An error occured while depositAndClose credit, error = [${JSON.stringify(e)}]`);
      return Promise.reject(e);
    }
  }

  public async addCredit(props: AddCreditProps): Promise<TransactionResponse | PopulatedTransaction> {
    try {
      const line = props.lineAddress;
      // check if status is ACTIVE
      //if (!(await this.isActive(line))) {
      // throw new Error(`Adding credit is not possible. reason: "The given creditLine [${line}] is not active`);
      // }
      //const populatedTrx = await this.executeContractMethod(
      //props.lineAddress,
      //'addCredit',
      //[props.drate, props.frate, props.amount, props.token, props.lender],
      //true
      //);
      // check mutualConsent
      console.log('this is line address', line);

      let data = {
        drate: props.drate,
        frate: props.frate,
        amount: props.amount,
        token: props.token,
        lender: props.lender,
        network: props.network,
      };
      //@ts-ignore
      return <TransactionResponse>(
        await this.executeContractMethod(
          line,
          'addCredit',
          [data.drate, data.frate, data.amount, data.token, data.lender],
          props.network,
          true
        )
      );
    } catch (e) {
      console.log(`An error occured while adding credit, error = [${JSON.stringify(e)}]`);
      return Promise.reject(e);
    }
  }

  public async borrow(props: BorrowCreditProps): Promise<TransactionResponse | PopulatedTransaction> {
    try {
      const line = props.line;

      let data = {
        id: props.positionId,
        amount: props.amount,
      };
      //@ts-ignore
      return <TransactionResponse>(
        await this.executeContractMethod(line, 'borrow', [data.id, data.amount], props.network, false)
      );
    } catch (e) {
      console.log(`An error occured while borrowing credit, error = [${JSON.stringify(e)}]`);
      return Promise.reject(e);
    }
  }

  private async executeContractMethod(
    contractAddress: string,
    methodName: string,
    params: any[],
    network: Network,
    dryRun: boolean = false
  ): Promise<TransactionResponse | PopulatedTransaction> {
    let props: ExecuteTransactionProps | undefined = undefined;
    // TODO. pass network as param all the way down from actions
    // const { getSigner } = this.web3Provider;
    // const user = getSigner();

    try {
      props = {
        network: network,
        contractAddress: contractAddress,
        abi: this.abi,
        args: params,
        methodName: methodName,
        overrides: {
          gasLimit: 600000,
        },
      };

      const tx = await this.transactionService.execute(props);
      await tx.wait();
      return tx;
    } catch (e) {
      console.log(
        `An error occured while ${methodName} with params [${params}] on CreditLine [${props?.contractAddress}], error = ${e} `
      );
      return Promise.reject(e);
    }
  }

  /* ============================= Helpers =============================*/

  public async getLenderByCreditID(contractAddress: string, id: BytesLike): Promise<Address> {
    return (await this._getContract(contractAddress).credits(id)).lender;
  }

  public async getInterestRateContract(contractAddress: string): Promise<Address> {
    return await this._getContract(contractAddress).interestRate();
  }

  public async getFirstID(contractAddress: string): Promise<BytesLike> {
    return await this._getContract(contractAddress).ids(0);
  }

  public async getCredit(contractAddress: string, id: BytesLike): Promise<Credit> {
    return await this._getContract(contractAddress).credits(id);
  }

  public async borrower(contractAddress: string): Promise<Address> {
    return await this._getContract(contractAddress).borrower();
  }

  public async isActive(contractAddress: string): Promise<boolean> {
    return (await this._getContract(contractAddress).status()) === STATUS.ACTIVE;
  }

  public async isBorrowing(contractAddress: string): Promise<boolean> {
    const id = await this._getContract(contractAddress).ids(0);
    return (
      (await this._getContract(contractAddress).count()) !== 0 &&
      (await this._getContract(contractAddress).credits(id)).principal !== 0
    );
  }

  public async isBorrower(contractAddress: string): Promise<boolean> {
    return (await this.getSignerAddress()) === (await this._getContract(contractAddress).borrower());
  }

  public async isLender(contractAddress: string, id: BytesLike): Promise<boolean> {
    return (await this.getSignerAddress()) === (await this.getLenderByCreditID(contractAddress, id));
  }

  // public async isLenderOnLine(contractAddress: string): Promise<boolean> {
  //   return (await this.getSignerAddress()) === (await this.getLenderByCreditID(contractAddress, id));
  // }

  public async isMutualConsent(
    contractAddress: string,
    trxData: string | undefined,
    signerOne: Address,
    signerTwo: Address
  ): Promise<boolean> {
    const signer = await this.getSignerAddress();
    const isSignerValid = signer === signerOne || signer === signerTwo;
    const nonCaller = signer === signerOne ? signerTwo : signerOne;
    const expectedHash = keccak256(ethers.utils.solidityPack(['string', 'address'], [trxData, nonCaller]));
    return isSignerValid && this.contract.mutualConsents(expectedHash);
  }

  public async isSignerBorrowerOrLender(contractAddress: string, id: BytesLike): Promise<boolean> {
    const signer = await this.getSignerAddress();
    const credit = await this._getContract(contractAddress).credits(id);
    return signer === credit.lender || signer === (await this.contract.borrower());
  }

  /* Subgraph Getters */

  public async getLine(props: GetLineProps): Promise<AggregatedCreditLine | undefined> {
    return;
  }

  public async getLines(prop: GetLinesProps): Promise<GetLinesResponse[] | undefined> {
    // todo get all token prices from yearn add update store with values
    const response = getLines(prop)
      .then((data) => data)
      .catch((err) => {
        console.log('CreditLineService: error fetching lines', err);
        return undefined;
      });
    return response;
  }

  // TODO
  public async getLinePage(prop: GetLinePageProps): Promise<GetLinePageResponse | undefined> {
    return getLinePage(prop)
      .then((data) => data)
      .catch((err) => {
        console.log('CreditLineService: error fetching lines', err);
        return undefined;
      });
  }

  public async getLinePageAuxData(prop: GetLinePageAuxDataProps): Promise<GetLinePageAuxDataResponse | undefined> {
    const response = getLinePageAuxData(prop).catch((err) => {
      console.log('CreditLineService: error fetching lines', err);
      return undefined;
    });
    return response;
  }

  public async getUserLinePositions(): Promise<any | undefined> {
    return;
  }

  public async getExpectedTransactionOutcome(): Promise<any | undefined> {
    return;
  }

  public async approveDeposit(): Promise<any | undefined> {
    return;
  }

  // public async approveZapOu:  () => Promise<any>t: {
  //   return;
  // };
  // public async signPermi:  () => Promise<any>t: {
  //   return;
  // };
  public async getDepositAllowance(): Promise<any | undefined> {
    return;
  }

  public async getWithdrawAllowance(): Promise<any | undefined> {
    return;
  }
}
