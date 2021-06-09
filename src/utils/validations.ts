import { Balance, Token, Vault, AllowancesMap } from '@types';
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
  vaultAddress: string;
  sellTokenData: Token;
  amount: BigNumber;
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
  const { tokenAllowancesMap, amount, vaultAddress, sellTokenData } = props;
  const isETH = sellTokenData.address === getConstants().ETHEREUM_ADDRESS;
  const isZapin = vaultAddress !== sellTokenData.address;
  const decimals = new BigNumber(sellTokenData.decimals);
  const ONE_UNIT = new BigNumber(10).pow(decimals);
  const amountInWei = amount.multipliedBy(ONE_UNIT);

  if (isETH) return { approved: true };

  let allowance = '0';
  let approved = false;
  if (isZapin) {
    allowance = tokenAllowancesMap[ZAP_IN_CONTRACT] ?? '0';
    approved = new BigNumber(allowance).gte(amountInWei);
  } else {
    allowance = tokenAllowancesMap[vaultAddress] ?? '0';
    approved = new BigNumber(allowance).gte(amountInWei);
  }
  if (!approved) {
    return { error: 'TOKEN AMOUNT NOT APPROVED' };
  }

  return { approved };
}
