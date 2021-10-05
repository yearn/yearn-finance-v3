import { RootState } from '@types';

const selectCurrentNetwork = (state: RootState) => state.network.current;

export const NetworkSelectors = {
  selectCurrentNetwork,
};
