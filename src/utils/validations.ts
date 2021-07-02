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
    return { error: 'INSUFFICIENT FUNDS' };
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

  if (isETH) return { approved: true }; // TODO this check should be moved to validateAllowance().

  return validateAllowance({
    tokenAmount: amount,
    tokenDecimals: sellTokenDecimals,
    tokenAllowancesMap: sellTokenAllowancesMap,
    spenderAddress: isZapin ? ZAP_IN_CONTRACT : vaultAddress,
  });
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
  const isZapOut = targetTokenAddress !== underlyingTokenAddress;

  if (!isZapOut) return { approved: true };

  return validateAllowance({
    tokenAmount: yvTokenAmount,
    tokenDecimals: yvTokenDecimals,
    tokenAllowancesMap: yvTokenAllowancesMap,
    spenderAddress: ZAP_OUT_CONTRACT,
  });
}

// ********************* Labs *********************

interface ValidateYvBoostEthAllowanceProps {
  sellTokenAmount: BigNumber;
  sellTokenDecimals: string;
  sellTokenAllowancesMap: AllowancesMap;
}

export function validateYvBoostEthInvestAllowance(props: ValidateYvBoostEthAllowanceProps): ValidationResonse {
  const PICKLE_ZAP_IN = getConfig().CONTRACT_ADDRESSES.pickleZapIn;
  const { sellTokenAmount, sellTokenDecimals, sellTokenAllowancesMap } = props;
  return validateAllowance({
    tokenAmount: sellTokenAmount,
    tokenDecimals: sellTokenDecimals,
    tokenAllowancesMap: sellTokenAllowancesMap,
    spenderAddress: PICKLE_ZAP_IN,
  });
}

export function validateYvBoostEthStakeAllowance(props: ValidateYvBoostEthAllowanceProps): ValidationResonse {
  const { PSLPYVBOOSTETH_GAUGE } = getConfig().CONTRACT_ADDRESSES;
  const { sellTokenAmount, sellTokenDecimals, sellTokenAllowancesMap } = props;
  return validateAllowance({
    tokenAmount: sellTokenAmount,
    tokenDecimals: sellTokenDecimals,
    tokenAllowancesMap: sellTokenAllowancesMap,
    spenderAddress: PSLPYVBOOSTETH_GAUGE,
  });
}

interface ValidateAllowanceProps {
  tokenAmount: BigNumber;
  tokenDecimals: string;
  tokenAllowancesMap: AllowancesMap;
  spenderAddress: string;
}
export function validateAllowance(props: ValidateAllowanceProps): ValidationResonse {
  const { tokenAmount, tokenDecimals, tokenAllowancesMap, spenderAddress } = props;
  const ONE_UNIT = toBN('10').pow(tokenDecimals);
  const amountInWei = tokenAmount.multipliedBy(ONE_UNIT);

  const allowance = toBN(tokenAllowancesMap[spenderAddress]);

  if (tokenAmount.isEqualTo(0) && allowance.isEqualTo(0)) {
    return { error: 'TOKEN NOT APPROVED' };
  }

  const approved = allowance.gte(amountInWei);
  if (!approved) {
    return { error: 'NEED TO APPROVE' };
  }

  return { approved: true };
}
