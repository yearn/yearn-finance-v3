import { EarningsDayData } from '@yfi/sdk';

import {
  parseHistoricalEarningsUnderlying,
  parseHistoricalEarningsUsd,
  parseLastEarningsUnderlying,
  parseLastEarningsUsd,
} from './chart';

describe('Chart', () => {
  const underlyingDecimals = 18;
  const otherUnderlyingDecimals = 17;

  const earnings: EarningsDayData[] = [
    {
      earnings: {
        amount: '1000000000000000000', // 1
        amountUsdc: '1000000000', // $1,000
      },
      date: '2022-01-01T01:01:01.001Z',
    },
    {
      earnings: {
        amount: '10000000000000000000', // 10
        amountUsdc: '10000000000', // $10,000
      },
      date: '2022-01-02T01:01:01.001Z',
    },
    {
      earnings: {
        amount: '100000000000000000000', // 100
        amountUsdc: '100000000000', // $100,000
      },
      date: '2022-01-03T01:01:01.001Z',
    },
  ];

  describe('parseHistoricalEarningsUnderlying', () => {
    const getExpectedEarnings = (data: { x: string; y: string }[]) => [
      {
        id: 'historicalEarningsUnderlying',
        data,
      },
    ];

    it.each`
      printText                                  | earnings     | underlyingDecimals
      ${'no earning and decimal are given'}      | ${undefined} | ${undefined}
      ${'no earning is given'}                   | ${undefined} | ${underlyingDecimals}
      ${'no decimal is given'}                   | ${earnings}  | ${undefined}
      ${'earning is [] and no decimal is given'} | ${[]}        | ${undefined}
      ${'earning is []'}                         | ${[]}        | ${underlyingDecimals}
    `(`should return [] when $printText`, ({ earnings, underlyingDecimals }) => {
      const actual = parseHistoricalEarningsUnderlying(earnings, underlyingDecimals);

      expect(actual).toEqual(getExpectedEarnings([]));
    });

    it('should parse historical earnings in underlying amount', () => {
      const actual = parseHistoricalEarningsUnderlying(earnings, underlyingDecimals);
      const expectedData = [
        { x: '2022-01-01', y: '1' },
        { x: '2022-01-02', y: '10' },
        { x: '2022-01-03', y: '100' },
      ];

      expect(actual).toEqual(getExpectedEarnings(expectedData));
    });

    it('should parse historical earnings in underlying amount given a different decimal', () => {
      const actual = parseHistoricalEarningsUnderlying(earnings, otherUnderlyingDecimals);
      const expectedData = [
        { x: '2022-01-01', y: '10' },
        { x: '2022-01-02', y: '100' },
        { x: '2022-01-03', y: '1000' },
      ];

      expect(actual).toEqual(getExpectedEarnings(expectedData));
    });

    it('should remove duplicate historical earnings', () => {
      const earningsWithDuplicates = earnings.concat(earnings);
      const actual = parseHistoricalEarningsUnderlying(earningsWithDuplicates, underlyingDecimals);
      const expectedData = [
        { x: '2022-01-01', y: '1' },
        { x: '2022-01-02', y: '10' },
        { x: '2022-01-03', y: '100' },
      ];

      expect(actual).toEqual(getExpectedEarnings(expectedData));
    });
  });

  describe('parseLastEarningsUnderlying', () => {
    it.each`
      printText                                  | earnings     | underlyingDecimals
      ${'no earning and decimal are given'}      | ${undefined} | ${undefined}
      ${'no earning is given'}                   | ${undefined} | ${underlyingDecimals}
      ${'no decimal is given'}                   | ${earnings}  | ${undefined}
      ${'earning is [] and no decimal is given'} | ${[]}        | ${undefined}
      ${'earning is []'}                         | ${[]}        | ${underlyingDecimals}
    `(`should return [] when $printText`, ({ earnings, underlyingDecimals }) => {
      const actual = parseLastEarningsUnderlying(earnings, underlyingDecimals);

      expect(actual).toEqual('0');
    });

    it('should parse last earnings in underlying amount', () => {
      const actual = parseLastEarningsUnderlying(earnings, underlyingDecimals);

      expect(actual).toEqual('100');
    });

    it('should parse last earnings in underlying amount given a different decimal', () => {
      const actual = parseLastEarningsUnderlying(earnings, otherUnderlyingDecimals);

      expect(actual).toEqual('1000');
    });
  });

  describe('parseHistoricalEarningsUsd', () => {
    const getExpectedEarnings = (data: { x: string; y: string }[]) => [
      {
        id: 'historicalEarningsUsd',
        data,
      },
    ];

    it.each`
      printText                | earnings
      ${'no earning is given'} | ${undefined}
      ${'earning is []'}       | ${[]}
    `(`should return [] when $printText`, ({ earnings }) => {
      const actual = parseHistoricalEarningsUsd(earnings);

      expect(actual).toEqual(getExpectedEarnings([]));
    });

    it('should parse historical earnings in usd amount', () => {
      const actual = parseHistoricalEarningsUsd(earnings);
      const expectedData = [
        { x: '2022-01-01', y: '1000' },
        { x: '2022-01-02', y: '10000' },
        { x: '2022-01-03', y: '100000' },
      ];

      expect(actual).toEqual(getExpectedEarnings(expectedData));
    });

    it('should remove duplicate historical earnings', () => {
      const earningsWithDuplicates = earnings.concat(earnings);
      const actual = parseHistoricalEarningsUsd(earningsWithDuplicates);
      const expectedData = [
        { x: '2022-01-01', y: '1000' },
        { x: '2022-01-02', y: '10000' },
        { x: '2022-01-03', y: '100000' },
      ];

      expect(actual).toEqual(getExpectedEarnings(expectedData));
    });
  });

  describe('parseLastEarningsUsd', () => {
    it.each`
      printText                | earnings
      ${'no earning is given'} | ${undefined}
      ${'earning is []'}       | ${[]}
    `(`should return [] when $printText`, ({ earnings }) => {
      const actual = parseLastEarningsUsd(earnings);

      expect(actual).toEqual('0');
    });

    it('should parse last earnings in usd amount', () => {
      const actual = parseLastEarningsUsd(earnings);

      expect(actual).toEqual('100000');
    });
  });
});
