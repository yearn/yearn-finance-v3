import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkAPI } from '@frameworks/redux';
import { keyBy, isEqual, remove } from 'lodash';

import { Message, NotificationsStatus } from '@types';
import notificationMessages from '../../../../client/data/notificationMessages.json';

/* -------------------------------------------------------------------------- */
/*                                 Clear State                                */
/* -------------------------------------------------------------------------- */

const clearActiveMessages = createAction<void>('notifications/clearActiveMessages');
const clearDismissedMessages = createAction<void>('notifications/clearDismissedMessages');

/* -------------------------------------------------------------------------- */
/*                                 Fetch Data                                 */
/* -------------------------------------------------------------------------- */
const importedNotifications = notificationMessages as Message[];

const getNotificationMessages = createAsyncThunk<NotificationsStatus, void, ThunkAPI>(
  'notifications/getNotificationMessages',
  async () => {
    const activeMessages = importedNotifications.filter((message) => {
      return message.active === true;
    });
    //test arrays are available at end of file
    const dismissedMessages = removeUpdatedMessagesFromDismissed(testActive, testDismissed);
    return { active: testActive, dismissed: testDismissed };
  }
);

const removeUpdatedMessagesFromDismissed = (activeMessages: Message[], dismissedMessages: Message[]) => {
  /* 
  This function handles the scenario where existing messages in notificationMessages.json were updated, 
  and a user had already dismissed the message. The updated message is removed from dismissedMessages, so
  that the user can see it. For example if a message was changed from 'warning' to 'critical' then that message 
  would be removed from dismissedMessages and shown again to the user. 
  */

  if (!dismissedMessages.length) {
    return dismissedMessages;
  }

  const dismissedById = keyBy(dismissedMessages, 'id');
  for (const [key] of Object.entries(dismissedById)) {
    const currentActiveMessage = activeMessages.find((message) => message.id === parseInt(key));
    const currentDismissedMessage = dismissedMessages.find((message) => message.id === parseInt(key));
    if (isEqual(currentActiveMessage, currentDismissedMessage) === false) {
      remove(dismissedMessages, (x) => x.id === parseInt(key));
    }
  }
  return dismissedMessages;
};

/* -------------------------------------------------------------------------- */
/*                                   Exports                                  */
/* -------------------------------------------------------------------------- */

export const NotificationsActions = {
  getNotificationMessages,
  clearActiveMessages,
  clearDismissedMessages,
};

//For testing
const testDismissed: Message[] = [
  {
    id: 0,
    type: 'warning',
    active: true,
    message: 'Welcome to <b> Yearn Finance 0 <b>',
  },
  {
    id: 2,
    type: 'info',
    active: true,
    message: 'Welcome to <b> Yearn Finance 2 <b>',
  },
];

//Since type of message id 0 is different, then removed from dismissed state
const testActive: Message[] = [
  {
    id: 0,
    type: 'critical',
    active: true,
    message: 'Welcome to <b> Yearn Finance 0 <b>',
  },
  {
    id: 2,
    type: 'info',
    active: true,
    message: 'Welcome to <b> Yearn Finance 2 <b>',
  },
];
