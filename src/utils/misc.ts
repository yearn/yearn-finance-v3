import { ethers } from 'ethers';
import { keyBy, merge, values, orderBy, toNumber, isString } from 'lodash';

import { createToken } from '@store/modules/tokens/tokens.selectors';
import { Balance, Token, TokenView } from '@types';

export const isValidAddress = (address: string): boolean => {
  try {
    ethers.utils.getAddress(address);
    return true;
  } catch (e) {
    return false;
  }
};

export const getUniqueAndCombine = (arrayA: any[], arrayB: any[], key: string) => {
  const merged = merge(keyBy(arrayA, key), keyBy(arrayB, key));
  return values(merged);
};

function isNumber(n: any) {
  return typeof n != 'boolean' && !isNaN(n);
}

export const sort = <T>(data: T[], by: Extract<keyof T, string>, order?: 'asc' | 'desc'): T[] => {
  const sortedData = orderBy(
    [...data],
    (item) => {
      const element = item[by];
      if (isNumber(element)) {
        return toNumber(element);
      }
      if (isString(element)) {
        return element.toLowerCase();
      }

      return element;
    },
    [order ?? 'desc']
  );
  return sortedData;
};

export const orderApy = (apyData: string, apyType: string) => {
  if (apyType === 'new') return Number.MAX_SAFE_INTEGER;
  if (apyType === 'n/a') return 0;

  return toNumber(apyData) ?? 0;
};

export const inIframe = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

export const inLedgerIframe = () => {
  try {
    return (
      window.self !== window.top &&
      (window?.location?.ancestorOrigins?.[0]?.includes('ledger') || window?.navigator?.userAgent.includes('Firefox'))
    );
  } catch (e) {
    return true;
  }
};

export const isCustomApyType = (apyType: string) => apyType === 'new' || apyType === 'n/a' || apyType === 'override';

export const getRandomId = (): string => new Date().getTime().toString(36) + Math.random().toString(36).slice(2);

export const createPlaceholderToken = (tokenData: Token): TokenView => {
  const userTokenData: Balance = {
    address: tokenData.address,
    token: tokenData,
    priceUsdc: tokenData.priceUsdc,
    balance: '0',
    balanceUsdc: '0',
  };
  return createToken({ tokenData, userTokenData, allowancesMap: {} });
};
