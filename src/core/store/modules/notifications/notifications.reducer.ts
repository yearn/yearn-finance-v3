import { createReducer } from '@reduxjs/toolkit';

import { initialStatus, NotificationsState } from '@types';

import { NotificationsActions } from './notifications.actions';

export const notificationsInitialState: NotificationsState = {
  messages: [],
  dismissedMessageIds: [],
  statusMap: {
    getNotificationMessages: { ...initialStatus },
  },
};

const { getNotificationMessages, dismissMessage } = NotificationsActions;

const notificationsReducer = createReducer(notificationsInitialState, (builder) => {
  builder
    .addCase(dismissMessage, (state, actions) => {
      state.dismissedMessageIds = [...state.dismissedMessageIds, actions.payload];
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
      state.messages = messages.filter((message) => {
        return message.active === true;
      });
      state.statusMap.getNotificationMessages = {};
    });
});

export default notificationsReducer;
