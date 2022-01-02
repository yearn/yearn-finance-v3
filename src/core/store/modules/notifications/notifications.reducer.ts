import { createReducer } from '@reduxjs/toolkit';

import { NotificationsActions } from './notifications.actions';
import { initialStatus, NotificationsState } from '@types';

export const notificationsInitialState: NotificationsState = {
  activeMessages: [],
  dismissedMessages: [],
  statusMap: {
    getNotificationMessages: { ...initialStatus },
  },
};

const { clearActiveMessages, clearDismissedMessages, getNotificationMessages } = NotificationsActions;

const notificationsReducer = createReducer(notificationsInitialState, (builder) => {
  builder

    /* -------------------------------------------------------------------------- */
    /*                                 Clear State                                */
    /* -------------------------------------------------------------------------- */
    .addCase(clearActiveMessages, (state) => {
      state.activeMessages = [];
    })

    .addCase(clearDismissedMessages, (state) => {
      state.dismissedMessages = [];
    })

    /* -------------------------------------------------------------------------- */
    /*                                 Fetch Data                                 */
    /* -------------------------------------------------------------------------- */
    .addCase(getNotificationMessages.pending, (state) => {
      state.statusMap.getNotificationMessages = { loading: true };
    })

    .addCase(getNotificationMessages.rejected, (state, { error }) => {
      state.statusMap.getNotificationMessages = { loading: false, error: error.message };
    })

    .addCase(getNotificationMessages.fulfilled, (state, { payload: notifications }) => {
      state.activeMessages = notifications.active;
      state.dismissedMessages = notifications.dismissed;
      state.statusMap.getNotificationMessages = {};
    });
});

export default notificationsReducer;
