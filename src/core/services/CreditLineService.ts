import { ContractFunction, ethers, PopulatedTransaction } from 'ethers';
import { BytesLike } from '@ethersproject/bytes/src.ts';
import { keccak256 } from 'ethers/lib/utils';

import {
  CreditLineService,
  YearnSdk,
  CreditLine,
  TransactionService,
  Web3Provider,
  Config,
  Address,
  TransactionResponse,
  STATUS,
  ExecuteTransactionProps,
  Credit,
  Network,
  CreditLinePage,
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
  InterestRateCreditService,
} from '@types';
import { getConfig } from '@config';
import { LineOfCreditABI } from '@services/contracts';
import { getContract } from '@frameworks/ethers';
import { getLine, getLinePage, getLines, getUserLinePositions } from '@frameworks/gql';
import { mapStatusToString } from '@src/utils';

export class CreditLineServiceImpl implements CreditLineService {
  private graphUrl: string;
  private web3Provider: Web3Provider;
  private transactionService: TransactionService;
  private config: Config;
  private readonly abi: Array<any>;
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
    const { GRAPH_API_URL } = getConfig();
    this.graphUrl = GRAPH_API_URL || 'https://api.thegraph.com';
    this.abi = LineOfCreditABI;
  }

  private _getContract(contractAddress: string) {
    return getContract(contractAddress.toString(), LineOfCreditABI, this.web3Provider.getSigner().provider);
  }

  private async getSignerAddress(): Promise<Address> {
    return await this.web3Provider.getSigner().getAddress();
  }

  public async addCredit(props: AddCreditProps): Promise<string> {
    try {
      const line = props.lineAddress;
      // check if status is ACTIVE
      if (!(await this.isActive(line))) {
        throw new Error(`Adding credit is not possible. reason: "The given creditLine [${line}] is not active`);
      }
      const populatedTrx = await this.executeContractMethod(
        props.lineAddress,
        'addCredit',
        [props.drate, props.frate, props.amount, props.token, props.lender],
        true
      );
      // check mutualConsent
      const borrower = await this.borrower(line);
      if (!(await this.isMutualConsent(line, populatedTrx.data, props.lender, borrower))) {
        throw new Error(
          `Adding credit is not possible. reason: "Consent has not been initialized by other party for the given creditLine [${props.lineAddress}]`
        );
      }

      return (<TransactionResponse>(await this.executeContractMethod(
        props.lineAddress,
        'addCredit',
        [props.drate, props.frate, props.amount, props.token, props.lender],
      ))).hash;
    } catch (e) {
      console.log(`An error occured while adding credit, error = [${JSON.stringify(e)}]`);
      return Promise.reject(e);
    }
  }

  public async close(props: CloseProps): Promise<string> {
    try {
      if (!(await this.isSignerBorrowerOrLender(props.lineAddress, props.id))) {
        throw new Error('Unable to close. Signer is not borrower or lender');
      }
      return (<TransactionResponse>await this.executeContractMethod(props.lineAddress, 'close', [props.id])).hash;
    } catch (e) {
      console.log(`An error occured while closing credit, error = [${JSON.stringify(e)}]`);
      return Promise.reject(e);
    }
  }

  public async withdraw(props: WithdrawLineProps): Promise<string> {
    try {
      if (!(await this.isLender(props.lineAddress, props.id))) {
        throw new Error('Cannot withdraw. Signer is not lender');
      }
      return (<TransactionResponse>(
        await this.executeContractMethod(
          props.lineAddress,
          'withdraw',
          [props.id, props.amount])
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
        true
      );
      const borrower = await this.borrower(line);
      const lender = await this.getLenderByCreditID(line, id);
      if (!(await this.isMutualConsent(line, populatedTrx.data, borrower, lender))) {
        throw new Error(
          `Setting rate is not possible. reason: "Consent has not been initialized by other party for the given creditLine [${props.lineAddress}]`
        );
      }

      return (<TransactionResponse>await this.executeContractMethod(
        props.lineAddress,
        'setRates',
        [props.id, props.drate, props.frate],
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
        true
      );

      const borrower = await this.borrower(line);
      const lender = await this.getLenderByCreditID(line, props.id);
      if (!(await this.isMutualConsent(line, populatedTrx.data, borrower, lender))) {
        throw new Error(
          `Increasing credit is not possible. reason: "Consent has not been initialized by other party for the given creditLine [${props.lineAddress}]`
        );
      }

      return (<TransactionResponse>await this.executeContractMethod(
        props.lineAddress,
        'increaseCredit',
        [props.id, props.amount],
      )).hash;
    } catch (e) {
      console.log(`An error occured while increasing credit, error = [${JSON.stringify(e)}]`);
      return Promise.reject(e);
    }
  }

  public async depositAndRepay(props: DepositAndRepayProps, interestRateCreditService: InterestRateCreditService): Promise<string> {
    try {
      if (!(await this.isBorrowing(props.lineAddress))) {
        throw new Error('Deposit and repay is not possible because not borrowing');
      }

      const id = await this.getFirstID(props.lineAddress);
      const credit = await this.getCredit(props.lineAddress, props.id);

      // check interest accrual
      // note: `accrueInterest` will not be called because it has a modifier that is expecting
      // line of credit to be the msg.sender. We should probably update that modifier since
      // it only does the calculation and doesn't change state.
      const calcAccrue = await interestRateCreditService.accrueInterest({
        contractAddress: await this.getInterestRateContract(props.lineAddress),
        id,
        drawnBalance: credit.principal,
        facilityBalance: credit.deposit,
      });
      const simulateAccrue = credit.interestAccrued.add(calcAccrue);
      if (props.amount.gt(credit.principal.add(simulateAccrue))) {
        throw new Error('Amount is greater than (principal + interest to be accrued). Enter lower amount.');
      }


      return (<TransactionResponse>await this.executeContractMethod(
          props.lineAddress,
          'depositAndRepay',
          [props.amount])
      ).hash;
    } catch (e) {
      console.log(`An error occured while depositAndRepay credit, error = [${JSON.stringify(e)}]`);
      return Promise.reject(e);
    }
  }

  public async depositAndClose(props: DepositAndCloseProps): Promise<string> {
    try {
      if (!(await this.isBorrowing(props.lineAddress))) {
        throw new Error('Deposit and close is not possible because not borrowing');
      }
      if (!(await this.isBorrower(props.lineAddress))) {
        throw new Error('Deposit and close is not possible because signer is not borrower');
      }
      return (<TransactionResponse>await this.executeContractMethod(
          props.lineAddress,
          'depositAndClose',
          [])
      ).hash;
    } catch (e) {
      console.log(`An error occured while depositAndClose credit, error = [${JSON.stringify(e)}]`);
      return Promise.reject(e);
    }
  }

  private async executeContractMethod(contractAddress: string, methodName: string, params: any[], dryRun: boolean = false): Promise<TransactionResponse | PopulatedTransaction> {
    let props: ExecuteTransactionProps | undefined = undefined;
    try {
      props = {
        network: 'mainnet',
        contractAddress: contractAddress,
        abi: this.abi,
        args: params,
        methodName: methodName,
      };
      if (dryRun) {
        return await this.transactionService.populateTransaction(props);
      }

      const tx = await this.transactionService.execute(props);
      await tx.wait();
      return tx;
    } catch (e) {
      console.log(
        `An error occured while ${methodName} with params [${params}] on CreditLine [${
          props?.contractAddress
        }], error = [${JSON.stringify(e)}] `
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

  public async getLine(props: GetLineProps): Promise<CreditLine | undefined> {
    return;
  }

  public async getLines(prop: GetLinesProps): Promise<CreditLine[] | undefined> {
    const response = getLines(prop)
      .then((data) => this.formatGetLinesData(data))
      .catch((err) => {
        console.log('CreditLineService: error fetching lines', err);
        return undefined;
      });
    return response;
  }

  /** Formatting functions. from GQL structured response to flat data for redux state  */
  private formatGetLinesData(response: any): CreditLine[] {
    return response.map((data: any) => {
      const {
        borrower: { id: borrower },
        status,
        // escrow: { id: escrow },
        // spigot: { id: spigot },
        ...rest
      } = data;
      return {
        ...rest,
        status: mapStatusToString(status),
        borrower,
      };
    });
  }

  public async getLinePage(prop: GetLinePageProps): Promise<CreditLinePage | undefined> {
    return;
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