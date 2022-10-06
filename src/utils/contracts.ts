import { getConfig } from '@config';

export const isNativeToken = (address: string) => {
  const { NATIVE, ETH } = getConfig().CONTRACT_ADDRESSES;

  return address === NATIVE || address === ETH;
};
