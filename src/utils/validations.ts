import { AllowancesMap } from '@types';
import BigNumber from 'bignumber.js';
import { getConfig } from '@config';
import { toBN } from './format';

interface ValidateVaultDepositProps {
  depositLimit: string;
  emergencyShutdown: boolean;
  userTokenBalance: string;
  tokenDecimals: string;
  amount: BigNumber;
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
  tokenDecimals: string;
  tokenAddress: string;
  vaultAddress: string;
  vaultUnderlyingTokenAddress: string;
  tokenAllowancesMap: AllowancesMap;
}

export interface ValidationResonse {
  approved?: boolean;
  error?: string;
}

// Vaults validations

export function validateVaultDeposit(props: ValidateVaultDepositProps): ValidationResonse {
  let { amount, depositLimit, emergencyShutdown, tokenDecimals, userTokenBalance } = props;
  userTokenBalance = userTokenBalance ?? '0';
  const depositLimitBN = depositLimit ? toBN(depositLimit) : undefined;
  const ONE_UNIT = toBN('10').pow(tokenDecimals);
  const amountInWei = amount.multipliedBy(ONE_UNIT);

  if (amountInWei.lte(0)) {
    return { error: 'INVALID AMOUNT' };
  }
  if (amountInWei.gt(userTokenBalance)) {
    return { error: 'INSUFICIENT FUNDS' };
  }
  if (depositLimitBN && depositLimitBN.gt(0) && depositLimitBN.lt(depositLimitBN.plus(amountInWei))) {
    return { error: 'EXCEEDED DEPOSIT LIMIT' };
  }
  if (emergencyShutdown) {
    return { error: 'VAULT IS DISABLED' };
  }
  return { approved: true };
}

export function validateVaultAllowance(props: ValidateVaultAllowanceProps): ValidationResonse {
  const ZAP_IN_CONTRACT = getConfig().CONTRACT_ADDRESSES.zapIn;
  const { amount, tokenAddress, tokenAllowancesMap, tokenDecimals, vaultUnderlyingTokenAddress, vaultAddress } = props;

  const isETH = tokenAddress === getConfig().ETHEREUM_ADDRESS;
  const isZapin = vaultUnderlyingTokenAddress !== tokenAddress;
  const ONE_UNIT = toBN('10').pow(tokenDecimals);
  const amountInWei = amount.multipliedBy(ONE_UNIT);

  if (isETH) return { approved: true };

  const allowance = isZapin ? toBN(tokenAllowancesMap[ZAP_IN_CONTRACT]) : toBN(tokenAllowancesMap[vaultAddress]);

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
