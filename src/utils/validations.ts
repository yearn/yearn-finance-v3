import BigNumber from 'bignumber.js';

import { AllowancesMap, Network } from '@types';
import { getConfig } from '@config';

import { toBN, formatPercent } from './format';

interface ValidateVaultDepositProps {
  sellTokenAmount: BigNumber;
  depositLimit: string;
  emergencyShutdown: boolean;
  userTokenBalance: string;
  sellTokenDecimals: string;
  vaultUnderlyingBalance: string;
  targetUnderlyingTokenAmount: string | undefined;
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
  spenderAddress: string;
  signature?: string;
}

export interface ValidateMigrateVaultAllowanceProps {
  amount: BigNumber;
  vaultAddress: string;
  vaultDecimals: string;
  vaultAllowancesMap: AllowancesMap;
  migrationContractAddress: string;
}

export interface ValidationResponse {
  approved?: boolean;
  error?: string;
}

// Vaults validations

export function validateVaultDeposit(props: ValidateVaultDepositProps): ValidationResponse {
  let {
    sellTokenAmount,
    depositLimit,
    emergencyShutdown,
    sellTokenDecimals,
    userTokenBalance,
    vaultUnderlyingBalance,
    targetUnderlyingTokenAmount,
  } = props;
  userTokenBalance = userTokenBalance ?? '0';
  const depositLimitBN = depositLimit ? toBN(depositLimit) : undefined;

  if (emergencyShutdown) {
    return { error: 'VAULT IS DISABLED' };
  }

  if (depositLimitBN && depositLimitBN.gt(0) && targetUnderlyingTokenAmount) {
    const availableAmountToDepositInVault = depositLimitBN.minus(vaultUnderlyingBalance);
    if (availableAmountToDepositInVault.lt(targetUnderlyingTokenAmount)) return { error: 'EXCEEDED DEPOSIT LIMIT' };
  }

  return basicValidateAmount({ sellTokenAmount, sellTokenDecimals, totalAmountAvailable: userTokenBalance });
}

export function validateVaultWithdraw(props: ValidateVaultWithdrawProps): ValidationResponse {
  let { yvTokenAmount, yvTokenDecimals, userYvTokenBalance } = props;
  userYvTokenBalance = userYvTokenBalance ?? '0';
  const ONE_UNIT = toBN('10').pow(yvTokenDecimals);
  const amountInWei = yvTokenAmount.multipliedBy(ONE_UNIT);

  if (yvTokenAmount.isZero()) return {};

  if (amountInWei.lt(0)) {
    return { error: 'Invalid amount' };
  }

  if (amountInWei.gt(userYvTokenBalance)) {
    return { error: 'Insufficient funds' };
  }

  return { approved: true };
}

export function validateVaultWithdrawAllowance(props: ValidateVaultWithdrawAllowanceProps): ValidationResponse {
  const {
    yvTokenAddress,
    yvTokenAmount,
    yvTokenDecimals,
    underlyingTokenAddress,
    targetTokenAddress,
    yvTokenAllowancesMap,
    spenderAddress,
    signature,
  } = props;
  const isZapOut = targetTokenAddress !== underlyingTokenAddress;

  if (!isZapOut || signature) return { approved: true };

  return validateAllowance({
    tokenAddress: yvTokenAddress,
    tokenAmount: yvTokenAmount,
    tokenDecimals: yvTokenDecimals,
    tokenAllowancesMap: yvTokenAllowancesMap,
    spenderAddress,
  });
}

export function validateMigrateVaultAllowance(props: ValidateMigrateVaultAllowanceProps): ValidationResponse {
  const { amount, vaultAddress, vaultDecimals, vaultAllowancesMap, migrationContractAddress } = props;

  return validateAllowance({
    tokenAddress: vaultAddress,
    tokenAmount: amount,
    tokenDecimals: vaultDecimals,
    tokenAllowancesMap: vaultAllowancesMap,
    spenderAddress: migrationContractAddress,
  });
}

// ********************* Labs *********************

// TODO: IMPLEMENT GENERIC LAB VALIDATIONS

// type LabAction = 'DEPOSIT' | 'WITHDRAW' | 'STAKE' | 'CLAIM' | 'REINVEST';

// interface ValidateLabActionProps extends ValidateVaultDepositProps {
//   action: LabAction;
// }

// interface ValidateLabActionAllowanceProps extends ValidateVaultAllowanceProps {
//   action: LabAction;
// }

// export function validateLabActionsAllowance(): ValidationResponse {
//   // TODO: GENERAL VALIDATION FOR LABS BASED ON LAB ADDRESS AND ACTION
//   return {};
// }

// export function validateLabActions(): ValidationResponse {
//   // TODO: GENERAL VALIDATION FOR LABS BASED ON LAB ADDRESS AND ACTION
//   return {};
// }

interface ValidateYvBoostEthActionsAllowanceProps {
  sellTokenAddress: string;
  sellTokenAmount: BigNumber;
  sellTokenDecimals: string;
  sellTokenAllowancesMap: AllowancesMap;
  action: 'INVEST' | 'STAKE';
}

export function validateYvBoostEthActionsAllowance(props: ValidateYvBoostEthActionsAllowanceProps): ValidationResponse {
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

interface ValidateYveCrvActionsAllowanceProps {
  labAddress: string;
  sellTokenAddress: string;
  sellTokenAmount: BigNumber;
  sellTokenDecimals: string;
  sellTokenAllowancesMap: AllowancesMap;
  action: 'LOCK' | 'REINVEST';
}

export function validateYveCrvActionsAllowance(props: ValidateYveCrvActionsAllowanceProps): ValidationResponse {
  const { y3CrvBackZapper, CRV, THREECRV, YVECRV } = getConfig().CONTRACT_ADDRESSES;
  const { labAddress, sellTokenAddress, sellTokenAmount, sellTokenDecimals, sellTokenAllowancesMap, action } = props;
  let spenderAddress: string = '';
  if (labAddress !== YVECRV) throw new Error('Only yveCrv is supported as labAddress for this method');

  if (action === 'LOCK') {
    spenderAddress = labAddress;
    if (sellTokenAddress !== CRV) throw new Error('Only Crv token is supported for YveCrv LOCK action');
  }
  if (action === 'REINVEST') {
    spenderAddress = y3CrvBackZapper;
    if (sellTokenAddress !== THREECRV) throw new Error('Only 3Crv token is supported for YveCrv STAKE action');
  }

  return validateAllowance({
    tokenAddress: sellTokenAddress,
    tokenAmount: sellTokenAmount,
    tokenDecimals: sellTokenDecimals,
    tokenAllowancesMap: sellTokenAllowancesMap,
    spenderAddress,
  });
}

// ********************* General *********************

interface ValidateAllowanceProps {
  tokenAddress: string;
  tokenAmount: BigNumber;
  tokenDecimals: string;
  tokenAllowancesMap: AllowancesMap;
  spenderAddress: string;
}
export function validateAllowance(props: ValidateAllowanceProps): ValidationResponse {
  const { tokenAddress, tokenAmount, tokenDecimals, tokenAllowancesMap, spenderAddress } = props;
  return basicValidateAllowance({
    tokenAddress,
    tokenAmount,
    tokenDecimals,
    rawAllowance: tokenAllowancesMap[spenderAddress],
  });
}

export interface BasicValidateAllowanceProps {
  tokenAddress: string;
  tokenAmount: BigNumber;
  tokenDecimals: string;
  rawAllowance: string;
}

export function basicValidateAllowance(props: BasicValidateAllowanceProps): ValidationResponse {
  const { tokenAddress, tokenAmount, tokenDecimals, rawAllowance } = props;
  const ONE_UNIT = toBN('10').pow(tokenDecimals);
  const amountInWei = tokenAmount.multipliedBy(ONE_UNIT);
  const isETH = tokenAddress === getConfig().ETHEREUM_ADDRESS;
  if (isETH) return { approved: true };

  const allowance = toBN(rawAllowance);

  if (tokenAmount.isEqualTo(0) && allowance.isEqualTo(0)) {
    return { approved: false };
  }

  const approved = allowance.gte(amountInWei);
  if (!approved) {
    return { approved: false };
  }

  return { approved: true };
}

export interface BasicValidateAmountProps {
  sellTokenAmount: BigNumber;
  sellTokenDecimals: string;
  totalAmountAvailable: string;
  maxAmountAllowed?: string;
}

export function basicValidateAmount(props: BasicValidateAmountProps): ValidationResponse {
  const { totalAmountAvailable, sellTokenAmount, sellTokenDecimals, maxAmountAllowed } = props;
  const ONE_UNIT = toBN('10').pow(sellTokenDecimals);
  const amountInWei = sellTokenAmount.multipliedBy(ONE_UNIT);

  if (sellTokenAmount.isZero()) return {};

  if (amountInWei.lt(0)) {
    return { error: 'Invalid amount' };
  }

  if (maxAmountAllowed && amountInWei.gt(maxAmountAllowed)) {
    return { error: 'Exceeded accepted amount' };
  }

  if (amountInWei.gt(totalAmountAvailable)) {
    return { error: 'Insufficient funds' };
  }

  return { approved: true };
}

export interface ValidateSlippageProps {
  slippageTolerance?: number;
  expectedSlippage?: number;
}

export function validateSlippage(props: ValidateSlippageProps): ValidationResponse {
  const { slippageTolerance, expectedSlippage } = props;

  if (slippageTolerance === undefined || expectedSlippage === undefined) return {};

  const isOverSlippageTolerance = toBN(expectedSlippage).gt(slippageTolerance);
  if (isOverSlippageTolerance) {
    return {
      error: `Expected slippage of ${formatPercent(
        expectedSlippage.toString(),
        1
      )} is over your slippage tolerance of ${formatPercent(slippageTolerance.toString(), 1)}`,
    };
  }

  return {};
}

export interface ValidateNetworkProps {
  currentNetwork: Network;
  walletNetwork?: Network;
}

export function validateNetwork(props: ValidateNetworkProps): ValidationResponse {
  const { currentNetwork, walletNetwork } = props;

  if (!walletNetwork) return { error: 'Wallet Not Connected' };
  if (currentNetwork !== walletNetwork)
    return { error: `Incorrect Network Selected. Change Your Wallet to ${currentNetwork} Network` };

  return {};
}
