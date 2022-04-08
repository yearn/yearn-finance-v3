import { getNetwork } from './network';

describe('Network', () => {
  describe('getNetwork', () => {
    beforeEach(() => {
      jest.spyOn(console, 'warn').mockImplementation();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('when the `networkId` is not supported', () => {
      it('should log a warn when given an unknown networkId string', () => {
        const actual = getNetwork('0');

        expect(console.warn).toHaveBeenCalledWith('Unknown networkId: 0 (as string)');
        expect(actual).toBe('other');
      });

      it('should log a warn when given an unknown networkId number', () => {
        const actual = getNetwork(0);

        expect(console.warn).toHaveBeenCalledWith('Unknown networkId: 0 (as number)');
        expect(actual).toBe('other');
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
