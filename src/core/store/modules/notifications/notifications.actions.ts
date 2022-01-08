import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkAPI } from '@frameworks/redux';

import { Message } from '@types';
import notificationMessages from '../../../../client/data/notificationMessages.json';

/* -------------------------------------------------------------------------- */
/*                                 Clear State                                */
/* -------------------------------------------------------------------------- */

const clearMessages = createAction<void>('notifications/clearMessages');
const clearDismissedMessageIds = createAction<void>('notifications/clearDismissedMessageIds');

/* -------------------------------------------------------------------------- */
/*                                 Fetch Data                                 */
/* -------------------------------------------------------------------------- */
const importedNotifications = notificationMessages as Message[];

const getNotificationMessages = createAsyncThunk<Message[], void, ThunkAPI>(
  'notifications/getNotificationMessages',
  async () => {
    return importedNotifications;
  }
);

/* -------------------------------------------------------------------------- */
/*                                   Exports                                  */
/* -------------------------------------------------------------------------- */

export const NotificationsActions = {
  getNotificationMessages,
  clearMessages,
  clearDismissedMessageIds,
};
