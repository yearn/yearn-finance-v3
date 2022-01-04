import { RootState } from '@types';

/* ---------------------------------- State --------------------------------- */
const selectUserWoofyBalance = (state: RootState) => state.user.nft.woofyNftBalance;
const selectUserBluePillBalance = (state: RootState) => state.user.nft.bluePillNftBalance;

/* --------------------------------- Exports -------------------------------- */
export const UserSelectors = {
  selectUserWoofyBalance,
  selectUserBluePillBalance,
};
