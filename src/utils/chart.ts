import { last, uniqBy } from 'lodash';

import { EarningsDayData } from '@types';
import { normalizeAmount, toBN, USDC_DECIMALS } from './format';

export function parseHistoricalEarnings(earnings?: EarningsDayData[]) {
  let chartData: { x: string; y: string }[] = [];
  const id = 'historicalEarnings';
  if (!earnings) return [{ id, data: chartData }];
  chartData = earnings.map((data) => {
    return {
      x: data.date.toString().split('T')[0],
      y: toBN(normalizeAmount(data.earnings.amountUsdc, USDC_DECIMALS)).toFixed(),
    };
  });

  chartData = uniqBy(chartData, 'x');

  return [{ id, data: chartData }];
}

export function parseLastEarnings(earnings?: EarningsDayData[]) {
  const currentEarning = last(earnings)?.earnings?.amountUsdc;
  return toBN(normalizeAmount(currentEarning, USDC_DECIMALS)).toFixed();
}
