import { last, uniqBy } from 'lodash';

import { EarningsDayData } from '@types';

import { normalizeAmount, toBN } from './format';

export function parseHistoricalEarnings(earnings?: EarningsDayData[], underlyingDecimals?: number) {
  let chartData: { x: string; y: string }[] = [];
  const id = 'historicalEarnings';
  if (!earnings || !underlyingDecimals) return [{ id, data: chartData }];
  chartData = earnings.map((data) => {
    return {
      x: data.date.toString().split('T')[0],
      y: toBN(normalizeAmount(data.earnings.amount, underlyingDecimals)).toFixed(),
    };
  });

  chartData = uniqBy(chartData, 'x');

  return [{ id, data: chartData }];
}

export function parseLastEarnings(earnings?: EarningsDayData[], underlyingDecimals?: number) {
  if (!underlyingDecimals) return '0';
  const currentEarning = last(earnings)?.earnings?.amount;
  return toBN(normalizeAmount(currentEarning, underlyingDecimals)).toFixed();
}
