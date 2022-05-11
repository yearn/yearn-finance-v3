import { RootState } from '@types';

const selectPartnerState = (state: RootState) => state.partner;

export const PartnerSelectors = {
  selectPartnerState,
};
