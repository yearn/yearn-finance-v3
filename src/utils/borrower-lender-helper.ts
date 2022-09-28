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
} from '@types';

interface ContractAddressesProps {
  creditLineAddress: string;
  spigotedLineAddress: string;
  escrowAddress: string;
}

export function borrowerLenderHelper(
  creditLineService: CreditLineService,
  interestRateCreditService: InterestRateCreditService,
  spigotedLineService: SpigotedLineService,
  escrowService: EscrowService,
  props: ContractAddressesProps
) {
  const addCredit = async (addCreditProps: AddCreditProps): Promise<string> => {
    // check if status is ACTIVE
    if (!(await creditLineService.isActive())) {
      throw new Error(
        `Adding credit is not possible. reason: "The given creditLine [${props.creditLineAddress}] is not active`
      );
    }
    const populatedTrx = await creditLineService.addCredit(addCreditProps, true);
    // check mutualConsent
    const borrower = await creditLineService.borrower();
    if (!(await creditLineService.isMutualConsent(populatedTrx.data, addCreditProps.lender, borrower))) {
      throw new Error(
        `Adding credit is not possible. reason: "Consent has not been initialized by other party for the given creditLine [${props.creditLineAddress}]`
      );
    }
    return (<TransactionResponse>await creditLineService.addCredit(addCreditProps, false)).hash;
  };

  const close = async (id: BytesLike): Promise<string> => {
    if (!(await creditLineService.isSignerBorrowerOrLender(props.creditLineAddress, id))) {
      throw new Error('Unable to close. Signer is not borrower or lender');
    }
    return (await creditLineService.close(id)).hash;
  };

  const setRates = async (id: BytesLike, drate: BigNumberish, frate: BigNumberish): Promise<string> => {
    // check mutualConsentById
    const populatedTrx = await creditLineService.setRates(id, drate, frate, true);
    const borrower = await creditLineService.borrower();
    const lender = await creditLineService.getLenderByCreditID(id);
    if (!(await creditLineService.isMutualConsent(populatedTrx.data, borrower, lender))) {
      throw new Error(
        `Setting rate is not possible. reason: "Consent has not been initialized by other party for the given creditLine [${props.creditLineAddress}]`
      );
    }

    return (<TransactionResponse>await creditLineService.setRates(id, drate, frate, false)).hash;
  };

  const increaseCredit = async (id: BytesLike, amount: BigNumberish): Promise<string> => {
    if (await creditLineService.isActive()) {
      throw new Error(
        `Increasing credit is not possible. reason: "The given creditLine [${props.creditLineAddress}] is not active"`
      );
    }

    // check mutualConsentById
    const populatedTrx = await creditLineService.increaseCredit(id, amount, true);
    const borrower = await creditLineService.borrower();
    const lender = await creditLineService.getLenderByCreditID(id);
    if (!(await creditLineService.isMutualConsent(populatedTrx.data, borrower, lender))) {
      throw new Error(
        `Increasing credit is not possible. reason: "Consent has not been initialized by other party for the given creditLine [${props.creditLineAddress}]`
      );
    }

    return (<TransactionResponse>await creditLineService.increaseCredit(id, amount, false)).hash;
  };

  const depositAndRepay = async (amount: BigNumber): Promise<string> => {
    if (!(await creditLineService.isBorrowing())) {
      throw new Error('Deposit and repay is not possible because not borrowing');
    }

    const id = await creditLineService.getFirstID();
    const credit = await creditLineService.getCredit(id);

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
    if (amount.gt(credit.principal.add(simulateAccrue))) {
      throw new Error('Amount is greater than (principal + interest to be accrued). Enter lower amount.');
    }
    return (<TransactionResponse>await creditLineService.depositAndRepay(id, amount, false)).hash;
  };

  const depositAndClose = async (id: string): Promise<string> => {
    if (!(await creditLineService.isBorrowing())) {
      throw new Error('Deposit and close is not possible because not borrowing');
    }
    if (!(await creditLineService.isBorrower())) {
      throw new Error('Deposit and close is not possible because signer is not borrower');
    }
    return (<TransactionResponse>await creditLineService.depositAndClose(id, false)).hash;
  };

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

  const addSpigot = async (revenueContract: Address, setting: ISpigotSetting): Promise<string> => {
    if (!(await spigotedLineService.isOwner())) {
      throw new Error('Cannot add spigot. Signer is not owner.');
    }

    if (revenueContract === props.spigotedLineAddress) {
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

  const withdraw = async (id: Bytes, amount: BigNumber): Promise<string> => {
    if (!(await creditLineService.isLender(id))) {
      throw new Error('Cannot withdraw. Signer is not lender');
    }
    return (await creditLineService.withdraw(id, amount)).hash;
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
