import { createSelector } from '@reduxjs/toolkit';

import { RootState, Message } from '@types';

/* ---------------------------------- State --------------------------------- */
const selectDismissedMessageIds = (state: RootState) => state.notifications.dismissedMessageIds;
const selectMessages = (state: RootState) => state.notifications.messages;
const selectActiveMessages = createSelector(
  [selectMessages, selectDismissedMessageIds],
  (messages, dismissedMessageIds) => {
    const activeMessages = messages.filter(({ id }) => !dismissedMessageIds.includes(id));
    return activeMessages;
  }
);

/* --------------------------------- Exports -------------------------------- */
export const NotificationsSelectors = {
  selectDismissedMessageIds,
  selectMessages,
  selectActiveMessages,
};
