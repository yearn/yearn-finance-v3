import { RootState } from '@types';

/* ---------------------------------- State --------------------------------- */
const selectDismissedMessages = (state: RootState) => state.notifications.dismissedMessages;
const selectActiveMessages = (state: RootState) => state.notifications.activeMessages;

/* --------------------------------- Exports -------------------------------- */
export const NotificationsSelectors = {
  selectDismissedMessages,
  selectActiveMessages,
};
