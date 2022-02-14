import { SerializedError } from '@reduxjs/toolkit';
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
  [SimulationError.PARTIAL_REVERT]: 'Partial revert simulating call',
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

export const parseError = (e: any): SerializedError => {
  if (e instanceof EthersError) {
    return {
      message: ETHERS_ERRORS[e.error_code] || e.message,
      name: e.error_type,
      code: e.error_code,
    };
  }

  if (e instanceof PriceFetchingError) {
    return {
      message: PRICE_FETCHING_ERRORS[e.error_code] || e.message,
      name: e.error_type,
      code: e.error_code,
    };
  }

  if (e instanceof TenderlyError) {
    return {
      message: TENDERLY_ERRORS[e.error_code] || e.message,
      name: e.error_type,
      code: e.error_code,
    };
  }

  if (e instanceof ZapperError) {
    return {
      message: ZAPPER_ERRORS[e.error_code] || e.message,
      name: e.error_type,
      code: e.error_code,
    };
  }

  if (e instanceof SimulationError) {
    return {
      message: SIMULATION_ERRORS[e.error_code] || e.message,
      name: e.error_type,
      code: e.error_code,
    };
  }

  if (e instanceof SdkError) {
    return {
      message: (e.error_code && SDK_ERRORS[e.error_code]) || e.message,
      name: e.error_type,
      code: e.error_code,
    };
  }

  if (e instanceof Error) {
    return {
      message: e.message,
    };
  }

  return {
    message: 'An unknown error ocurred',
    name: 'Unknown',
  };
};
