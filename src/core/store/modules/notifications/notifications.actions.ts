import { createAction, createAsyncThunk } from '@reduxjs/toolkit';

import { ThunkAPI } from '@frameworks/redux';
import { Message } from '@types';
import notificationMessages from '@client/data/notificationMessages.json';

const dismissMessage = createAction<number>('notifications/dismissMessage');

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
  dismissMessage,
};
