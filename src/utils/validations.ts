import { AllowancesMap } from '@types';
import BigNumber from 'bignumber.js';
import { getConstants } from '../config/constants';

interface ValidateVaultDepositProps {
  depositLimit: string;
  emergencyShutdown: boolean;
  userTokenBalance: string;
  tokenDecimals: string;
  amount: BigNumber;
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
  const depositLimitBN = depositLimit ? new BigNumber(depositLimit) : undefined;
  const decimals = new BigNumber(tokenDecimals);
  const ONE_UNIT = new BigNumber(10).pow(decimals);
  const amountInWei = amount.multipliedBy(ONE_UNIT);

  if (amountInWei.lte(0)) {
    return { error: 'INVALID AMOUNT' };
  }
  if (amountInWei.gt(userTokenBalance)) {
    return { error: 'INSUFICIENT FUNDS' };
  }
  if (depositLimitBN && depositLimitBN.lt(depositLimitBN.plus(amountInWei))) {
    return { error: 'EXCEEDED DEPOSIT LIMIT' };
  }
  if (emergencyShutdown) {
    return { error: 'VAULT IS DISABLED' };
  }
  return { approved: true };
}

export function validateVaultAllowance(props: ValidateVaultAllowanceProps): ValidationResonse {
  const ZAP_IN_CONTRACT = getConstants().CONTRACT_ADDRESSES.zapIn;
  const { amount, tokenAddress, tokenAllowancesMap, tokenDecimals, vaultUnderlyingTokenAddress, vaultAddress } = props;

  const isETH = tokenAddress === getConstants().ETHEREUM_ADDRESS;
  const isZapin = vaultUnderlyingTokenAddress !== tokenAddress;
  const ONE_UNIT = new BigNumber(10).pow(tokenDecimals);
  const amountInWei = amount.multipliedBy(ONE_UNIT);

  if (isETH) return { approved: true };

  const allowance = isZapin
    ? new BigNumber(tokenAllowancesMap[ZAP_IN_CONTRACT] ?? '0')
    : new BigNumber(tokenAllowancesMap[vaultAddress] ?? '0');

  if (amount.isEqualTo(0) && allowance.isEqualTo(0)) {
    return { error: 'TOKEN NOT APPROVED' };
  }

  const approved = allowance.gte(amountInWei);
  if (!approved) {
    return { error: 'TOKEN AMOUNT NOT APPROVED' };
  }

  return { approved };
}
