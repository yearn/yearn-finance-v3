import {
  CreditLineEvents,
  CollateralEvent,
  ModuleNames,
  ESCROW_MODULE_NAME,
  SPIGOT_MODULE_NAME,
  LineStatusTypes,
  UNINITIALIZED_STATUS,
  ACTIVE_STATUS,
  LIQUIDATABLE_STATUS,
  REPAID_STATUS,
  INSOLVENT_STATUS,
  NO_STATUS,
} from '@types';

export const mapStatusToString = (status: number): LineStatusTypes => {
  switch (status) {
    case 0:
      return UNINITIALIZED_STATUS;
    case 2:
      return ACTIVE_STATUS;
    case 3:
      return LIQUIDATABLE_STATUS;
    case 4:
      return REPAID_STATUS;
    case 5:
      return INSOLVENT_STATUS;
    default:
      return NO_STATUS;
  }
};

/**
 * @function
 * @name mergeCollateralEvents
 * @desc - takes all events for a single deposit/spigot and merges them into global list
 * @dev  - expects all events to be in the same token
 * @param type - the type of module used as collateral
 * @param symbol - the token in event
 * @param price - the price to use for events. Generally current price for escrow and time of event for spigot
 * @param events - the events to process
 */
export const formatCreditEvents = (symbol: string, price: number = 0, events: CreditLineEvents[]) => {
  return events.map((e: any): CreditLineEvents => {
    const { id, __typename, amount, timestamp, value } = e;
    return {
      id,
      __typename,
      timestamp,
      symbol: symbol || 'UNKNOWN',
      amount,
      value,
      currentValue: price * value,
    };
  });
};

/**
 * @function
 * @name mergeCollateralEvents
 * @desc - takes all events for a single deposit/spigot and merges them into global list
 * @dev  - expects all events to be in the same token
 * @param type - the type of module used as collateral
 * @param symbol - the token in event
 * @param price - current price for escrow and spigot collateral
 * @param events - the events to process
 * @return totalVal, CollateralEvent[] - current total value of all collateral
 */
export const formatCollateralEvents = (
  type: ModuleNames,
  symbol: string,
  price: number = 0,
  events: CollateralEvent[],
  tokenRevenue?: any
): [number, CollateralEvent[]] => {
  let totalVal = 0;
  // TODO promise.all token price fetching for better performance
  const newEvents: CollateralEvent[] = events.map((e: any): CollateralEvent => {
    const { __typename, timestamp, amount, value } = e;
    const valueNow = price * amount;
    if (type === SPIGOT_MODULE_NAME) {
      // aggregate token revenue. not needed for escrow bc its already segmented by token
      // use price at time of revenue for more accuracy
      tokenRevenue[symbol] += value;
    }
    totalVal += valueNow;
    return {
      type,
      __typename,
      timestamp,
      amount,
      value,
      valueNow,
      symbol: symbol || 'UNKNOWN',
    };
  });
  return [totalVal, newEvents];
};
