import { EthersError, PriceFetchingError, SdkError, SimulationError, TenderlyError, ZapperError } from '@yfi/sdk';

import { parseError } from './errors';

describe('Errors', () => {
  describe('parseError', () => {
    it.each`
      errorName                                      | errorArgument                                                                        | serializedError
      ${'EthersError: FAIL_TOKEN_FETCH'}             | ${new EthersError('error message', EthersError.FAIL_TOKEN_FETCH)}                    | ${{ code: EthersError.FAIL_TOKEN_FETCH, message: 'Error fetching token', name: 'ethers' }}
      ${'EthersError: NO_DECIMALS'}                  | ${new EthersError('error message', EthersError.NO_DECIMALS)}                         | ${{ code: EthersError.NO_DECIMALS, message: 'No decimals set for vault', name: 'ethers' }}
      ${'EthersError: NO_PRICE_PER_SHARE'}           | ${new EthersError('error message', EthersError.NO_PRICE_PER_SHARE)}                  | ${{ code: EthersError.NO_PRICE_PER_SHARE, message: 'No price per share set for vault', name: 'ethers' }}
      ${'EthersError: POPULATING_TRANSACTION'}       | ${new EthersError('error message', EthersError.POPULATING_TRANSACTION)}              | ${{ code: EthersError.POPULATING_TRANSACTION, message: 'Error populating transaction', name: 'ethers' }}
      ${'EthersError: error code'}                   | ${new EthersError('error message', 'error code')}                                    | ${{ code: 'error code', message: 'error message', name: 'ethers' }}
      ${'PriceFetchingError: FETCHING_PRICE_PICKLE'} | ${new PriceFetchingError('error message', PriceFetchingError.FETCHING_PRICE_PICKLE)} | ${{ code: PriceFetchingError.FETCHING_PRICE_PICKLE, message: 'Error fetching price from pickle', name: 'price_fetching' }}
      ${'PriceFetchingError: FETCHING_PRICE_ORACLE'} | ${new PriceFetchingError('error message', PriceFetchingError.FETCHING_PRICE_ORACLE)} | ${{ code: PriceFetchingError.FETCHING_PRICE_ORACLE, message: 'Error fetching price from oracle', name: 'price_fetching' }}
      ${'PriceFetchingError: error code'}            | ${new PriceFetchingError('error message', 'error code')}                             | ${{ code: 'error code', message: 'error message', name: 'price_fetching' }}
      ${'TenderlyError: SIMULATION_CALL'}            | ${new TenderlyError('error message', TenderlyError.SIMULATION_CALL)}                 | ${{ code: TenderlyError.SIMULATION_CALL, message: 'Simulation call to Tenderly failed', name: 'tenderly' }}
      ${'TenderlyError: error code'}                 | ${new TenderlyError('error message', 'error code')}                                  | ${{ code: 'error code', message: 'error message', name: 'tenderly' }}
      ${'ZapperError: ZAP_IN'}                       | ${new ZapperError('error message', ZapperError.ZAP_IN)}                              | ${{ code: ZapperError.ZAP_IN, message: 'Error Zapping in token', name: 'zapper' }}
      ${'ZapperError: ZAP_IN_APPROVAL_STATE'}        | ${new ZapperError('error message', ZapperError.ZAP_IN_APPROVAL_STATE)}               | ${{ code: ZapperError.ZAP_IN_APPROVAL_STATE, message: 'Error getting approval Zap in state of token', name: 'zapper' }}
      ${'ZapperError: ZAP_IN_APPROVAL'}              | ${new ZapperError('error message', ZapperError.ZAP_IN_APPROVAL)}                     | ${{ code: ZapperError.ZAP_IN_APPROVAL, message: 'Error approving Zap in of token', name: 'zapper' }}
      ${'ZapperError: ZAP_OUT'}                      | ${new ZapperError('error message', ZapperError.ZAP_OUT)}                             | ${{ code: ZapperError.ZAP_OUT, message: 'Error Zapping out token', name: 'zapper' }}
      ${'ZapperError: ZAP_OUT_APPROVAL_STATE'}       | ${new ZapperError('error message', ZapperError.ZAP_OUT_APPROVAL_STATE)}              | ${{ code: ZapperError.ZAP_OUT_APPROVAL_STATE, message: 'Error getting approval Zap out state of token', name: 'zapper' }}
      ${'ZapperError: ZAP_OUT_APPROVAL'}             | ${new ZapperError('error message', ZapperError.ZAP_OUT_APPROVAL)}                    | ${{ code: ZapperError.ZAP_OUT_APPROVAL, message: 'Error approving Zap out of token', name: 'zapper' }}
      ${'ZapperError: error code'}                   | ${new ZapperError('error message', 'error code')}                                    | ${{ code: 'error code', message: 'error message', name: 'zapper' }}
      ${'SimulationError: NO_LOG'}                   | ${new SimulationError('error message', SimulationError.NO_LOG)}                      | ${{ code: SimulationError.NO_LOG, message: 'No log of transfering token', name: 'simulation' }}
      ${'SimulationError: PARTIAL_REVERT'}           | ${new SimulationError('error message', SimulationError.PARTIAL_REVERT)}              | ${{ code: SimulationError.PARTIAL_REVERT, message: 'Partial revert simulating call', name: 'simulation' }}
      ${'SimulationError: TENDERLY_RESPONSE_ERROR'}  | ${new SimulationError('error message', SimulationError.TENDERLY_RESPONSE_ERROR)}     | ${{ code: SimulationError.TENDERLY_RESPONSE_ERROR, message: 'Error on Tenderly response', name: 'simulation' }}
      ${'SimulationError: error code'}               | ${new SimulationError('error message', 'error code')}                                | ${{ code: 'error code', message: 'error message', name: 'simulation' }}
      ${'SdkError: NO_SLIPPAGE'}                     | ${new SdkError('error message', SdkError.NO_SLIPPAGE)}                               | ${{ code: SdkError.NO_SLIPPAGE, message: 'No slippage set', name: 'sdk' }}
      ${'SdkError: error code'}                      | ${new SdkError('error message', 'error code')}                                       | ${{ code: 'error code', message: 'error message', name: 'sdk' }}
      ${'Error'}                                     | ${new Error('error message')}                                                        | ${{ message: 'error message' }}
      ${'null'}                                      | ${null}                                                                              | ${{ message: 'An unknown error occurred', name: 'Unknown' }}
      ${'undefined'}                                 | ${undefined}                                                                         | ${{ message: 'An unknown error occurred', name: 'Unknown' }}
    `(`should return "$serializedError" when given "$errorName"`, ({ errorArgument, serializedError }) => {
      const actual = parseError(errorArgument);

      expect(actual).toStrictEqual(serializedError);
    });
  });
});
