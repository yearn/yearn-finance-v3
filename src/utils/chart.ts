import { last, uniqBy } from 'lodash';

import { EarningsDayData } from '@types';

import { normalizeAmount, toBN, USDC_DECIMALS } from './format';

export function parseHistoricalEarningsUnderlying(earnings?: EarningsDayData[], underlyingDecimals?: number) {
  let chartData: { x: string; y: string }[] = [];
  const id = 'historicalEarningsUnderlying';
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

export function parseLastEarningsUnderlying(earnings?: EarningsDayData[], underlyingDecimals?: number) {
  if (!underlyingDecimals) return '0';
  const currentEarning = last(earnings)?.earnings?.amount;
  return toBN(normalizeAmount(currentEarning, underlyingDecimals)).toFixed();
}

export function parseHistoricalEarningsUsd(earnings?: EarningsDayData[]) {
  let chartData: { x: string; y: string }[] = [];
  const id = 'historicalEarningsUsd';
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

export function parseLastEarningsUsd(earnings?: EarningsDayData[]) {
  const currentEarning = last(earnings)?.earnings?.amountUsdc;
  return toBN(normalizeAmount(currentEarning, USDC_DECIMALS)).toFixed();
}
