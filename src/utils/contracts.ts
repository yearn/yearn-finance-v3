import { getConfig } from '@config';

export const getZapInContractAddress = (vaultAddress: string) => {
  const { zapIn } = getConfig().CONTRACT_ADDRESSES;

  return zapIn;
};
