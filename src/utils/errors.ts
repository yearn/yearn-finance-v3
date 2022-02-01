import { EthersError, PriceFetchingError, SdkError, SimulationError, TenderlyError, ZapperError } from '@yfi/sdk';

const ETHERS_ERRORS = {
  [EthersError.FAIL_TOKEN_FETCH]: 'Error fetching token',
  [EthersError.NO_DECIMALS]: 'No decimals set for vault',
  [EthersError.NO_PRICE_PER_SHARE]: 'No price per share set for vault',
  [EthersError.POPULATING_TRANSACTION]: 'Error populating transaction',
};
const PRICE_FETCHING_ERRORS = {
  [PriceFetchingError.FETCHING_PRICE_PICKLE]: 'Error fetching price from pickle',
  [PriceFetchingError.FETCHING_PRICE_ORACLE]: 'Error fetching price from oracle',
};
const SDK_ERRORS = {
  [SdkError.NO_SLIPPAGE]: 'No slippage set',
};
const SIMULATION_ERRORS = {
  [SimulationError.NO_LOG]: 'No log of transfering token',
  [SimulationError.PARTIAL_REVERT]: 'Partial rever simulating call',
  [SimulationError.TENDERLY_RESPONSE_ERROR]: 'Error on Tenderly response',
};
const TENDERLY_ERRORS = {
  [TenderlyError.SIMULATION_CALL]: 'Simulation call to Tenderly failed',
};
const ZAPPER_ERRORS = {
  [ZapperError.ZAP_IN]: 'Error Zapping in token',
  [ZapperError.ZAP_IN_APPROVAL]: 'Error getting approval Zap in state of token',
  [ZapperError.ZAP_IN_APPROVAL_STATE]: 'Error approving Zap in of token fetching token',
  [ZapperError.ZAP_OUT]: 'Error Zapping out token',
  [ZapperError.ZAP_OUT_APPROVAL]: 'Error getting approval Zap out state of token',
  [ZapperError.ZAP_OUT_APPROVAL_STATE]: 'Error approving Zap out of token fetching token',
};

export const parseError = (e: any) => {
  if (e instanceof EthersError) {
    return ETHERS_ERRORS[e.error_code] || e.message;
  }

  if (e instanceof PriceFetchingError) {
    return PRICE_FETCHING_ERRORS[e.error_code] || e.message;
  }

  if (e instanceof TenderlyError) {
    return TENDERLY_ERRORS[e.error_code] || e.message;
  }

  if (e instanceof ZapperError) {
    return ZAPPER_ERRORS[e.error_code] || e.message;
  }

  if (e instanceof SimulationError) {
    return SIMULATION_ERRORS[e.error_code] || e.message;
  }

  if (e instanceof SdkError) {
    return (e.error_code && SDK_ERRORS[e.error_code]) || e.message;
  }

  if (e instanceof Error) {
    return e.message;
  }

  return 'There was an error';
};
