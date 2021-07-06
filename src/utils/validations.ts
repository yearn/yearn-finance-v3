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
  yvTokenAddress: string;
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

  if (amountInWei.lt(0)) {
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

  const isZapin = vaultUnderlyingTokenAddress !== sellTokenAddress;

  return validateAllowance({
    tokenAddress: sellTokenAddress,
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

  if (amountInWei.lt(0)) {
    return { error: 'INVALID AMOUNT' };
  }
  if (amountInWei.gt(userYvTokenBalance)) {
    return { error: 'INSUFICIENT FUNDS' };
  }

  return { approved: true };
}

export function validateVaultWithdrawAllowance(props: ValidateVaultWithdrawAllowanceProps): ValidationResonse {
  const ZAP_OUT_CONTRACT = getConfig().CONTRACT_ADDRESSES.zapOut;
  let {
    yvTokenAddress,
    yvTokenAmount,
    yvTokenDecimals,
    underlyingTokenAddress,
    targetTokenAddress,
    yvTokenAllowancesMap,
  } = props;
  const isZapOut = targetTokenAddress !== underlyingTokenAddress;

  if (!isZapOut) return { approved: true };

  return validateAllowance({
    tokenAddress: yvTokenAddress,
    tokenAmount: yvTokenAmount,
    tokenDecimals: yvTokenDecimals,
    tokenAllowancesMap: yvTokenAllowancesMap,
    spenderAddress: ZAP_OUT_CONTRACT,
  });
}

// ********************* Labs *********************

interface ValidateYvBoostEthActionsAllowanceProps {
  sellTokenAddress: string;
  sellTokenAmount: BigNumber;
  sellTokenDecimals: string;
  sellTokenAllowancesMap: AllowancesMap;
  action: 'INVEST' | 'STAKE';
}

export function validateYvBoostEthActionsAllowance(props: ValidateYvBoostEthActionsAllowanceProps): ValidationResonse {
  const { PSLPYVBOOSTETH_GAUGE, pickleZapIn: PICKLE_ZAP_IN, PSLPYVBOOSTETH } = getConfig().CONTRACT_ADDRESSES;
  const { sellTokenAddress, sellTokenAmount, sellTokenDecimals, sellTokenAllowancesMap, action } = props;
  let spenderAddress: string = '';

  if (action === 'INVEST') spenderAddress = PICKLE_ZAP_IN;
  if (action === 'STAKE') {
    spenderAddress = PSLPYVBOOSTETH_GAUGE;
    if (sellTokenAddress !== PSLPYVBOOSTETH) throw new Error('Only PSLPYVBOOSTETH token is supported for STAKE action');
  }

  return validateAllowance({
    tokenAddress: sellTokenAddress,
    tokenAmount: sellTokenAmount,
    tokenDecimals: sellTokenDecimals,
    tokenAllowancesMap: sellTokenAllowancesMap,
    spenderAddress,
  });
}

interface ValidateAllowanceProps {
  tokenAddress: string;
  tokenAmount: BigNumber;
  tokenDecimals: string;
  tokenAllowancesMap: AllowancesMap;
  spenderAddress: string;
}
export function validateAllowance(props: ValidateAllowanceProps): ValidationResonse {
  const { tokenAddress, tokenAmount, tokenDecimals, tokenAllowancesMap, spenderAddress } = props;
  const ONE_UNIT = toBN('10').pow(tokenDecimals);
  const amountInWei = tokenAmount.multipliedBy(ONE_UNIT);
  const isETH = tokenAddress === getConfig().ETHEREUM_ADDRESS;
  if (isETH) return { approved: true };

  const allowance = toBN(tokenAllowancesMap[spenderAddress]);

  if (tokenAmount.isEqualTo(0) && allowance.isEqualTo(0)) {
    return { approved: false };
  }

  const approved = allowance.gte(amountInWei);
  if (!approved) {
    return { approved: false };
  }

  return { approved: true };
}
