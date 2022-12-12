import BigNumber from 'bignumber.js';

import { GeneralLabView, SummaryData, Unit, Wei } from '@types';

import { toBN, toUnit } from './format';

interface CalculateSharesAmountProps {
  decimals: string;
  pricePerShare: string;
  amount: BigNumber;
}

export function calculateSharesAmount(props: CalculateSharesAmountProps): Wei {
  const { amount, decimals, pricePerShare } = props;
  if (amount.isNaN() || amount.eq(0)) return '0';
  const sharePrice = toUnit(pricePerShare, parseInt(decimals));
  const ONE_UNIT = toBN('10').pow(decimals);
  return amount.div(sharePrice).times(ONE_UNIT).toFixed(0);
}

interface CalculateUnderlyingAmountProps {
  underlyingTokenDecimals: string;
  pricePerShare: string;
  shareAmount: Unit;
}

export function calculateUnderlyingAmount(props: CalculateUnderlyingAmountProps): Wei {
  const { underlyingTokenDecimals, pricePerShare } = props;
  const amount = toBN(props.shareAmount);
  if (amount.isNaN() || amount.eq(0)) return '0';
  const sharePrice = toUnit(pricePerShare, parseInt(underlyingTokenDecimals));
  const ONE_UNIT = toBN('10').pow(underlyingTokenDecimals);
  return amount.times(sharePrice).times(ONE_UNIT).toFixed(0);
}

export function computeSummaryData(labs: Pick<GeneralLabView, 'apyData' | 'DEPOSIT'>[]): SummaryData {
  const { totalDeposits, totalEarnings } = labs.reduce(
    ({ totalDeposits, totalEarnings }, { DEPOSIT: { userDepositedUsdc }, apyData }) => ({
      totalDeposits: totalDeposits.plus(userDepositedUsdc),
      totalEarnings: totalEarnings.plus(toBN(userDepositedUsdc).times(apyData)),
    }),
    {
      totalDeposits: toBN(0),
      totalEarnings: toBN(0),
    }
  );

  return {
    totalDeposits: totalDeposits.toString(),
    totalEarnings: totalEarnings.toString(),
    estYearlyYield: totalDeposits.isZero() ? '0' : totalEarnings.div(totalDeposits).toString(),
  };
}
