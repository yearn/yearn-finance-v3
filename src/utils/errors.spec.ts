import { EthersError, PriceFetchingError, SdkError, SimulationError, TenderlyError, ZapperError } from '@yfi/sdk';

import { parseError } from './errors';

describe('Errors', () => {
  describe('parseError', () => {
    it.each`
      errorArgument                                                                        | serializedError
      ${new EthersError('error message', EthersError.FAIL_TOKEN_FETCH)}                    | ${{ code: EthersError.FAIL_TOKEN_FETCH, message: 'Error fetching token', name: 'ethers' }}
      ${new EthersError('error message', EthersError.NO_DECIMALS)}                         | ${{ code: EthersError.NO_DECIMALS, message: 'No decimals set for vault', name: 'ethers' }}
      ${new EthersError('error message', EthersError.NO_PRICE_PER_SHARE)}                  | ${{ code: EthersError.NO_PRICE_PER_SHARE, message: 'No price per share set for vault', name: 'ethers' }}
      ${new EthersError('error message', EthersError.POPULATING_TRANSACTION)}              | ${{ code: EthersError.POPULATING_TRANSACTION, message: 'Error populating transaction', name: 'ethers' }}
      ${new EthersError('error message', 'error code')}                                    | ${{ code: 'error code', message: 'error message', name: 'ethers' }}
      ${new PriceFetchingError('error message', PriceFetchingError.FETCHING_PRICE_PICKLE)} | ${{ code: PriceFetchingError.FETCHING_PRICE_PICKLE, message: 'Error fetching price from pickle', name: 'price_fetching' }}
      ${new PriceFetchingError('error message', PriceFetchingError.FETCHING_PRICE_ORACLE)} | ${{ code: PriceFetchingError.FETCHING_PRICE_ORACLE, message: 'Error fetching price from oracle', name: 'price_fetching' }}
      ${new PriceFetchingError('error message', 'error code')}                             | ${{ code: 'error code', message: 'error message', name: 'price_fetching' }}
      ${new TenderlyError('error message', TenderlyError.SIMULATION_CALL)}                 | ${{ code: TenderlyError.SIMULATION_CALL, message: 'Simulation call to Tenderly failed', name: 'tenderly' }}
      ${new TenderlyError('error message', 'error code')}                                  | ${{ code: 'error code', message: 'error message', name: 'tenderly' }}
      ${new ZapperError('error message', ZapperError.ZAP_IN)}                              | ${{ code: ZapperError.ZAP_IN, message: 'Error Zapping in token', name: 'zapper' }}
      ${new ZapperError('error message', ZapperError.ZAP_IN_APPROVAL_STATE)}               | ${{ code: ZapperError.ZAP_IN_APPROVAL_STATE, message: 'Error getting approval Zap in state of token', name: 'zapper' }}
      ${new ZapperError('error message', ZapperError.ZAP_IN_APPROVAL)}                     | ${{ code: ZapperError.ZAP_IN_APPROVAL, message: 'Error approving Zap in of token', name: 'zapper' }}
      ${new ZapperError('error message', ZapperError.ZAP_OUT)}                             | ${{ code: ZapperError.ZAP_OUT, message: 'Error Zapping out token', name: 'zapper' }}
      ${new ZapperError('error message', ZapperError.ZAP_OUT_APPROVAL_STATE)}              | ${{ code: ZapperError.ZAP_OUT_APPROVAL_STATE, message: 'Error getting approval Zap out state of token', name: 'zapper' }}
      ${new ZapperError('error message', ZapperError.ZAP_OUT_APPROVAL)}                    | ${{ code: ZapperError.ZAP_OUT_APPROVAL, message: 'Error approving Zap out of token', name: 'zapper' }}
      ${new ZapperError('error message', 'error code')}                                    | ${{ code: 'error code', message: 'error message', name: 'zapper' }}
      ${new SimulationError('error message', SimulationError.NO_LOG)}                      | ${{ code: SimulationError.NO_LOG, message: 'No log of transfering token', name: 'simulation' }}
      ${new SimulationError('error message', SimulationError.PARTIAL_REVERT)}              | ${{ code: SimulationError.PARTIAL_REVERT, message: 'Partial revert simulating call', name: 'simulation' }}
      ${new SimulationError('error message', SimulationError.TENDERLY_RESPONSE_ERROR)}     | ${{ code: SimulationError.TENDERLY_RESPONSE_ERROR, message: 'Error on Tenderly response', name: 'simulation' }}
      ${new SimulationError('error message', 'error code')}                                | ${{ code: 'error code', message: 'error message', name: 'simulation' }}
      ${new SdkError('error message', SdkError.NO_SLIPPAGE)}                               | ${{ code: SdkError.NO_SLIPPAGE, message: 'No slippage set', name: 'sdk' }}
      ${new SdkError('error message', 'error code')}                                       | ${{ code: 'error code', message: 'error message', name: 'sdk' }}
      ${new Error('error message')}                                                        | ${{ message: 'error message' }}
      ${null}                                                                              | ${{ message: 'An unknown error occurred', name: 'Unknown' }}
      ${undefined}                                                                         | ${{ message: 'An unknown error occurred', name: 'Unknown' }}
    `(`should return "$serializedError" when given "$errorArgument"`, ({ errorArgument, serializedError }) => {
      const actual = parseError(errorArgument);

      expect(actual).toStrictEqual(serializedError);
    });
  });
});
