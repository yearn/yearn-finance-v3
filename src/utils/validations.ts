import { AllowancesMap } from '@types';
import BigNumber from 'bignumber.js';
import { getConfig } from '@config';
import { toBN } from './format';

interface ValidateVaultDepositProps {
  sellTokenAmount: BigNumber;
  depositLimit: string;
  emergencyShutdown: boolean;
  userTokenBalance: string;
  sellTokenDecimals: string;
  vaultUnderlyingBalance: string;
}
interface ValidateVaultWithdrawProps {
  yvTokenAmount: BigNumber;
  yvTokenDecimals: string;
  userYvTokenBalance: string;
}
interface ValidateVaultWithdrawAllowanceProps {
  yvTokenAmount: BigNumber;
  yvTokenDecimals: string;
  underlyingTokenAddress: string;
  targetTokenAddress: string;
  yvTokenAllowancesMap: AllowancesMap;
}

export interface ValidateVaultAllowanceProps {
  amount: BigNumber;
  vaultAddress: string;
  vaultUnderlyingTokenAddress: string;
  sellTokenAddress: string;
  sellTokenDecimals: string;
  sellTokenAllowancesMap: AllowancesMap;
}

export interface ValidationResonse {
  approved?: boolean;
  error?: string;
}

// Vaults validations

export function validateVaultDeposit(props: ValidateVaultDepositProps): ValidationResonse {
  let {
    sellTokenAmount,
    depositLimit,
    emergencyShutdown,
    sellTokenDecimals,
    userTokenBalance,
    vaultUnderlyingBalance,
  } = props;
  userTokenBalance = userTokenBalance ?? '0';
  const depositLimitBN = depositLimit ? toBN(depositLimit) : undefined;
  const ONE_UNIT = toBN('10').pow(sellTokenDecimals);
  const amountInWei = sellTokenAmount.multipliedBy(ONE_UNIT);

  if (amountInWei.lte(0)) {
    return { error: 'INVALID AMOUNT' };
  }
  if (amountInWei.gt(userTokenBalance)) {
    return { error: 'INSUFICIENT FUNDS' };
  }

  // TODO we need to wait until we decide what to do with the convertion rate from sdk.
  // if (depositLimitBN && depositLimitBN.gt(0) && TODO CHECK IF depositLimit.lt(...)))) {
  //   return { error: 'EXCEEDED DEPOSIT LIMIT' };
  // }

  if (emergencyShutdown) {
    return { error: 'VAULT IS DISABLED' };
  }
  return { approved: true };
}

export function validateVaultAllowance(props: ValidateVaultAllowanceProps): ValidationResonse {
  const ZAP_IN_CONTRACT = getConfig().CONTRACT_ADDRESSES.zapIn;
  const {
    amount,
    vaultAddress,
    vaultUnderlyingTokenAddress,
    sellTokenAddress,
    sellTokenDecimals,
    sellTokenAllowancesMap,
  } = props;

  const isETH = sellTokenAddress === getConfig().ETHEREUM_ADDRESS;
  const isZapin = vaultUnderlyingTokenAddress !== sellTokenAddress;
  const ONE_UNIT = toBN('10').pow(sellTokenDecimals);
  const amountInWei = amount.multipliedBy(ONE_UNIT);

  if (isETH) return { approved: true };

  const allowance = isZapin
    ? toBN(sellTokenAllowancesMap[ZAP_IN_CONTRACT])
    : toBN(sellTokenAllowancesMap[vaultAddress]);

  if (amount.isEqualTo(0) && allowance.isEqualTo(0)) {
    return { error: 'TOKEN NOT APPROVED' };
  }

  const approved = allowance.gte(amountInWei);
  if (!approved) {
    return { error: 'TOKEN AMOUNT NOT APPROVED' };
  }

  return { approved };
}

export function validateVaultWithdraw(props: ValidateVaultWithdrawProps): ValidationResonse {
  let { yvTokenAmount, yvTokenDecimals, userYvTokenBalance } = props;
  userYvTokenBalance = userYvTokenBalance ?? '0';
  const ONE_UNIT = toBN('10').pow(yvTokenDecimals);
  const amountInWei = yvTokenAmount.multipliedBy(ONE_UNIT);

  if (amountInWei.lte(0)) {
    return { error: 'INVALID AMOUNT' };
  }
  if (amountInWei.gt(userYvTokenBalance)) {
    return { error: 'INSUFICIENT FUNDS' };
  }

  return { approved: true };
}

export function validateVaultWithdrawAllowance(props: ValidateVaultWithdrawAllowanceProps): ValidationResonse {
  const ZAP_OUT_CONTRACT = getConfig().CONTRACT_ADDRESSES.zapOut;
  let { yvTokenAmount, yvTokenDecimals, underlyingTokenAddress, targetTokenAddress, yvTokenAllowancesMap } = props;
  const ONE_UNIT = toBN('10').pow(yvTokenDecimals);
  const amountInWei = yvTokenAmount.multipliedBy(ONE_UNIT);
  const isZapOut = targetTokenAddress !== underlyingTokenAddress;

  if (!isZapOut) return { approved: true };

  const allowance = toBN(yvTokenAllowancesMap[ZAP_OUT_CONTRACT]);

  if (yvTokenAmount.isEqualTo(0) && allowance.isEqualTo(0)) {
    return { error: 'TOKEN NOT APPROVED' };
  }

  const approved = allowance.gte(amountInWei);
  if (!approved) {
    return { error: 'NEED TO APPROVE' };
  }

  return { approved: true };
}
