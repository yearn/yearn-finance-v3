import { BigNumberish, BigNumber, ethers } from 'ethers';
import { BytesLike, Bytes } from '@ethersproject/bytes/src.ts';

import {
  Address,
  CreditLineService,
  EscrowService,
  ISpigotSetting,
  SpigotedLineService,
  TransactionResponse,
  InterestRateCreditService,
  AddCreditProps,
  SetRatesProps,
  IncreaseCreditProps,
  DepositAndRepayProps,
  CloseProps,
  DepositAndCloseProps,
  WithdrawLineProps,
} from '@types';

export function borrowerLenderHelper(
  creditLineService: CreditLineService,
  interestRateCreditService: InterestRateCreditService,
  spigotedLineService: SpigotedLineService,
  escrowService: EscrowService
) {
  // CreditLineService

  const addCredit = async (props: AddCreditProps): Promise<string> => {
    const line = props.lineAddress;
    // check if status is ACTIVE
    if (!(await creditLineService.isActive(line))) {
      throw new Error(`Adding credit is not possible. reason: "The given creditLine [${line}] is not active`);
    }
    const populatedTrx = await creditLineService.addCredit(props);
    // check mutualConsent
    const borrower = await creditLineService.borrower(line);
    if (!(await creditLineService.isMutualConsent(line, populatedTrx.data, props.lender, borrower))) {
      throw new Error(
        `Adding credit is not possible. reason: "Consent has not been initialized by other party for the given creditLine [${props.lineAddress}]`
      );
    }
    return (<TransactionResponse>await creditLineService.addCredit(props)).hash;
  };

  const close = async (props: CloseProps): Promise<string> => {
    if (!(await creditLineService.isSignerBorrowerOrLender(props.lineAddress, props.id))) {
      throw new Error('Unable to close. Signer is not borrower or lender');
    }
    return (await creditLineService.close(props)).hash;
  };

  const setRates = async (props: SetRatesProps): Promise<string> => {
    const { lineAddress: line, id } = props;
    // check mutualConsentById
    const populatedTrx = await creditLineService.setRates(props);
    const borrower = await creditLineService.borrower(line);
    const lender = await creditLineService.getLenderByCreditID(line, id);
    if (!(await creditLineService.isMutualConsent(line, populatedTrx.data, borrower, lender))) {
      throw new Error(
        `Setting rate is not possible. reason: "Consent has not been initialized by other party for the given creditLine [${props.lineAddress}]`
      );
    }

    return (<TransactionResponse>await creditLineService.setRates(props)).hash;
  };

  const increaseCredit = async (props: IncreaseCreditProps): Promise<string> => {
    const line = props.lineAddress;
    if (await creditLineService.isActive(line)) {
      throw new Error(`Increasing credit is not possible. reason: "The given creditLine [${line}] is not active"`);
    }

    // check mutualConsentById
    const populatedTrx = await creditLineService.increaseCredit(props);
    const borrower = await creditLineService.borrower(line);
    const lender = await creditLineService.getLenderByCreditID(line, props.id);
    if (!(await creditLineService.isMutualConsent(line, populatedTrx.data, borrower, lender))) {
      throw new Error(
        `Increasing credit is not possible. reason: "Consent has not been initialized by other party for the given creditLine [${props.lineAddress}]`
      );
    }

    return (<TransactionResponse>await creditLineService.increaseCredit(props)).hash;
  };

  const depositAndRepay = async (props: DepositAndRepayProps): Promise<string> => {
    if (!(await creditLineService.isBorrowing(props.lineAddress))) {
      throw new Error('Deposit and repay is not possible because not borrowing');
    }

    const id = await creditLineService.getFirstID(props.lineAddress);
    const credit = await creditLineService.getCredit(props.lineAddress, props.id);

    // check interest accrual
    // note: `accrueInterest` will not be called because it has a modifier that is expecting
    // line of credit to be the msg.sender. We should probably update that modifier since
    // it only does the calculation and doesn't change state.
    const calcAccrue = await interestRateCreditService.accrueInterest({
      id,
      drawnBalance: credit.principal,
      facilityBalance: credit.deposit,
    });
    const simulateAccrue = credit.interestAccrued.add(calcAccrue);
    if (props.amount.gt(credit.principal.add(simulateAccrue))) {
      throw new Error('Amount is greater than (principal + interest to be accrued). Enter lower amount.');
    }
    return (<TransactionResponse>await creditLineService.depositAndRepay(props)).hash;
  };

  const depositAndClose = async (props: DepositAndCloseProps): Promise<string> => {
    if (!(await creditLineService.isBorrowing(props.lineAddress))) {
      throw new Error('Deposit and close is not possible because not borrowing');
    }
    if (!(await creditLineService.isBorrower(props.lineAddress))) {
      throw new Error('Deposit and close is not possible because signer is not borrower');
    }
    return (<TransactionResponse>await creditLineService.depositAndClose(props)).hash;
  };

  const withdraw = async (props: WithdrawLineProps): Promise<string> => {
    if (!(await creditLineService.isLender(props.lineAddress, props.id))) {
      throw new Error('Cannot withdraw. Signer is not lender');
    }
    return (await creditLineService.withdraw(props)).hash;
  };

  // SpigotedLineService

  const claimAndTrade = async (claimToken: Address, zeroExTradeData: Bytes): Promise<string> => {
    if (!(await spigotedLineService.isBorrowing())) {
      throw new Error('Claim and trade is not possible because not borrowing');
    }
    if (!(await spigotedLineService.isBorrower())) {
      throw new Error('Claim and trade is not possible because signer is not borrower');
    }
    return (<TransactionResponse>await spigotedLineService.claimAndTrade(claimToken, zeroExTradeData, false)).hash;
  };

  const claimAndRepay = async (claimToken: Address, calldata: BytesLike): Promise<string> => {
    if (!(await spigotedLineService.isBorrowing())) {
      throw new Error('Claim and repay is not possible because not borrowing');
    }

    if (!(await spigotedLineService.isSignerBorrowerOrLender(await spigotedLineService.getFirstID()))) {
      throw new Error('Claim and repay is not possible because signer is not borrower or lender');
    }
    return (<TransactionResponse>await spigotedLineService.claimAndRepay(claimToken, calldata, false)).hash;
  };

  const addSpigot = async (
    lineAddress: Address,
    revenueContract: Address,
    setting: ISpigotSetting
  ): Promise<string> => {
    if (!(await spigotedLineService.isOwner())) {
      throw new Error('Cannot add spigot. Signer is not owner.');
    }

    if (revenueContract === lineAddress) {
      throw new Error('Invalid revenue contract address. `revenueContract` address is same as `spigotedLineAddress`');
    }

    if (
      setting.transferOwnerFunction.length === 0 ||
      setting.ownerSplit.gt(await spigotedLineService.maxSplit()) ||
      setting.token === ethers.constants.AddressZero
    ) {
      throw new Error('Bad setting');
    }

    return ((await spigotedLineService.addSpigot(revenueContract, setting, false)) as TransactionResponse).hash;
  };

  // EscrowService

  const addCollateral = async (amount: BigNumber, token: Address): Promise<string> => {
    if (amount.lte(0)) {
      throw new Error('Cannot add collateral. Amount is 0 or less');
    }
    return (<TransactionResponse>await escrowService.addCollateral(amount, token, false)).hash;
  };

  const releaseCollateral = async (amount: BigNumber, token: Address, to: Address): Promise<string> => {
    if (amount.lte(0)) {
      throw new Error('Cannot release collateral. Amount is 0 or less');
    }

    if (!(await escrowService.isBorrower())) {
      throw new Error('Release collateral is not possible because signer is not borrower');
    }

    return (<TransactionResponse>await escrowService.releaseCollateral(amount, token, to, false)).hash;
  };

  return {
    addCredit,
    close,
    withdraw,
    setRates,
    increaseCredit,
    depositAndRepay,
    depositAndClose,
    claimAndTrade,
    claimAndRepay,
    addSpigot,
    addCollateral,
    releaseCollateral,
  };
}
