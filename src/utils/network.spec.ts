import { getNetwork } from './network';

describe('Network', () => {
  describe('getNetwork', () => {
    describe('when the `networkId` is not supported', () => {
      it('should throw when given an unknown networkId string', () => {
        try {
          getNetwork('0');
        } catch (error) {
          expect(error).toStrictEqual(new Error('Unknown networkId: 0 (as string)'));
        }
      });

      it('should throw when given an unknown networkId number', () => {
        try {
          getNetwork(0);
        } catch (error) {
          expect(error).toStrictEqual(new Error('Unknown networkId: 0 (as number)'));
        }
      });
    });

    describe('when the `networkId` is supported and given as a string', () => {
      it.each`
        networkId  | network
        ${'1'}     | ${'mainnet'}
        ${'2'}     | ${'morden'}
        ${'3'}     | ${'ropsten'}
        ${'4'}     | ${'rinkeby'}
        ${'42'}    | ${'kovan'}
        ${'250'}   | ${'fantom'}
        ${'42161'} | ${'arbitrum'}
      `(`should return "$network" when given "$networkId" (string)`, ({ networkId, network }) => {
        expect(getNetwork(networkId)).toBe(network);
      });
    });

    describe('when the `networkId` is supported and given as a number', () => {
      it.each`
        networkId | network
        ${1}      | ${'mainnet'}
        ${2}      | ${'morden'}
        ${3}      | ${'ropsten'}
        ${4}      | ${'rinkeby'}
        ${42}     | ${'kovan'}
        ${250}    | ${'fantom'}
        ${42161}  | ${'arbitrum'}
      `(`should return "$network" when given $networkId (number)`, ({ networkId, network }) => {
        expect(getNetwork(networkId)).toBe(network);
      });
    });
  });
});
