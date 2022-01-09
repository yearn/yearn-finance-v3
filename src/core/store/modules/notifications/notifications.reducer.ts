import { createReducer } from '@reduxjs/toolkit';

import { NotificationsActions } from './notifications.actions';
import { initialStatus, NotificationsState } from '@types';

export const notificationsInitialState: NotificationsState = {
  messages: [],
  dismissedMessageIds: [],
  statusMap: {
    getNotificationMessages: { ...initialStatus },
  },
};

const { clearMessages, clearDismissedMessageIds, getNotificationMessages, dismissMessage } = NotificationsActions;

const notificationsReducer = createReducer(notificationsInitialState, (builder) => {
  builder
    .addCase(dismissMessage, (state, actions) => {
      state.dismissedMessageIds = [...state.dismissedMessageIds, actions.payload];
    })

    /* -------------------------------------------------------------------------- */
    /*                                 Clear State                                */
    /* -------------------------------------------------------------------------- */
    .addCase(clearMessages, (state) => {
      state.messages = [];
    })

    .addCase(clearDismissedMessageIds, (state) => {
      state.dismissedMessageIds = [];
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

    .addCase(getNotificationMessages.fulfilled, (state, { payload: messages }) => {
      state.messages = messages;
      state.statusMap.getNotificationMessages = {};
    });
});

export default notificationsReducer;
