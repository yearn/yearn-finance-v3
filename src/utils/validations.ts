import { AllowancesMap, IronBankUserSummary } from '@types';
import BigNumber from 'bignumber.js';
import { getConfig } from '@config';
import { COLLATERAL_FACTOR_DECIMALS, normalizeAmount, toBN } from './format';

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
  } = props;
  userTokenBalance = userTokenBalance ?? '0';
  const depositLimitBN = depositLimit ? toBN(depositLimit) : undefined;
  // const ONE_UNIT = toBN('10').pow(sellTokenDecimals);
  // const amountInWei = sellTokenAmount.multipliedBy(ONE_UNIT);

  // TODO we need to wait until we decide what to do with the convertion rate from sdk.
  // if (depositLimitBN && depositLimitBN.gt(0) && TODO CHECK IF depositLimit.lt(...)))) {
  //   return { error: 'EXCEEDED DEPOSIT LIMIT' };
  // }

  if (emergencyShutdown) {
    return { error: 'VAULT IS DISABLED' };
  }

  return basicValidateAmount({ sellTokenAmount, sellTokenDecimals, totalAmountAvailable: userTokenBalance });
}

export function validateVaultAllowance(props: ValidateVaultAllowanceProps): ValidationResponse {
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

export function validateVaultWithdraw(props: ValidateVaultWithdrawProps): ValidationResponse {
  let { yvTokenAmount, yvTokenDecimals, userYvTokenBalance } = props;
  userYvTokenBalance = userYvTokenBalance ?? '0';
  const ONE_UNIT = toBN('10').pow(yvTokenDecimals);
  const amountInWei = yvTokenAmount.multipliedBy(ONE_UNIT);

  if (yvTokenAmount.isZero()) return {};

  if (amountInWei.lt(0)) {
    return { error: 'INVALID AMOUNT' };
  }
  if (amountInWei.gt(userYvTokenBalance)) {
    return { error: 'INSUFICIENT FUNDS' };
  }

  return { approved: true };
}

export function validateVaultWithdrawAllowance(props: ValidateVaultWithdrawAllowanceProps): ValidationResponse {
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

// ********************* Iron Bank *********************

export function validateExitMarket(props: ValidateExitMarketsProps): ValidationResponse {
  const { marketSuppliedUsdc, marketCollateralFactor, userIronBankSummary } = props;

  if (!userIronBankSummary) return { error: 'USER SUMMARY IS UNDEFINED' };
  const totalBorrowedUsdc = userIronBankSummary.borrowBalanceUsdc;
  const totalBorrowLimitUsdc = userIronBankSummary.borrowLimitUsdc;

  const marketBorrowLimit = toBN(marketSuppliedUsdc)
    .times(normalizeAmount(marketCollateralFactor, COLLATERAL_FACTOR_DECIMALS))
    .toFixed(0);

  const futureBorrowLimit = toBN(totalBorrowLimitUsdc).minus(marketBorrowLimit);

  if (futureBorrowLimit.lt(totalBorrowedUsdc)) return { error: 'INSUFFICIENT COLLATERAL TO EXIT MARKET' };

  return { approved: true };
}

export interface ValidateExitMarketsProps {
  marketSuppliedUsdc: string;
  marketCollateralFactor: string;
  userIronBankSummary: IronBankUserSummary | undefined;
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
    return { error: 'INVALID AMOUNT' };
  }

  if (maxAmountAllowed && amountInWei.gt(maxAmountAllowed)) {
    return { error: 'EXCEEDED ACCEPTED AMOUNT' };
  }

  if (amountInWei.gt(totalAmountAvailable)) {
    return { error: 'INSUFFICIENT FUNDS' };
  }

  return { approved: true };
}
