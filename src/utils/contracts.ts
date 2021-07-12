import { getConfig } from '@config';

export const getZapInContractAddress = (vaultAddress: string) => {
  const { PSLPYVBOOSTETH, zapIn, pickleZapIn } = getConfig().CONTRACT_ADDRESSES;

  return vaultAddress === PSLPYVBOOSTETH ? pickleZapIn : zapIn;
};

export const getStakingContractAddress = (vaultAddress: string) => {
  const { PSLPYVBOOSTETH, PSLPYVBOOSTETH_GAUGE } = getConfig().CONTRACT_ADDRESSES;

  return vaultAddress === PSLPYVBOOSTETH ? PSLPYVBOOSTETH_GAUGE : vaultAddress;
};
