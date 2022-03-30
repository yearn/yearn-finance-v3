import BigNumber from 'bignumber.js';

import { toBN, toUnit, toWei } from './format';

describe('Formatters', () => {
  describe('toBN', () => {
    it('should convert `string` to `BigNumber`', () => {
      const actual = toBN('123');

      expect(actual).toEqual(new BigNumber(123));
      expect(actual instanceof BigNumber).toBeTruthy();
    });

    it('should convert `number` to `BigNumber`', () => {
      const actual = toBN(123);

      expect(actual).toEqual(new BigNumber(123));
      expect(actual instanceof BigNumber).toBeTruthy();
    });

    it.each`
      falsyArgument
      ${false}
      ${0}
      ${''}
      ${null}
      ${undefined}
      ${NaN}
    `(`should return \`BigNumber(0)\` when given "$falsyArgument"`, ({ falsyArgument }) => {
      const actual = toBN(falsyArgument);

      expect(actual).toEqual(new BigNumber(0));
      expect(actual instanceof BigNumber).toBeTruthy();
    });

    it('should return `BigNumber(0)` when given a falsy argument', () => {
      const actualWithEmptyString = toBN('');
      const actualWithUndefined = toBN();

      expect(actualWithEmptyString).toEqual(new BigNumber(0));
      expect(actualWithEmptyString instanceof BigNumber).toBeTruthy();
      expect(actualWithUndefined).toEqual(new BigNumber(0));
      expect(actualWithUndefined instanceof BigNumber).toBeTruthy();
    });
  });

  describe('toWei', () => {
    it('should convert amount in Unit to Wei', () => {
      const actual = toWei('123', 18);

      expect(actual).toEqual('123000000000000000000');
    });
  });

  describe('toUnit', () => {
    it('should convert amount in Wei to Unit', () => {
      const actual = toUnit('123000000000000000000', 18);

      expect(actual).toEqual('123');
    });
  });
});
