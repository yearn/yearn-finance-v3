import { createAction, createAsyncThunk } from '@reduxjs/toolkit';

import { ThunkAPI } from '@frameworks/redux';
import { Alert, AlertTypes } from '@types';
import { getConfig } from '@config';
import { getRandomId } from '@utils';

export interface AlertProps {
  message: string;
  type?: AlertTypes;
  persistent?: boolean;
  timeout?: number;
}

const closeAlert = createAction<{ alertId: string }>('alerts/closeAlert');

const openAlert = createAsyncThunk<
  { alert: Alert },
  { message: string; type?: AlertTypes; persistent?: boolean; timeout?: number },
  ThunkAPI
>('alerts/openAlert', async ({ message, type, persistent, timeout }, { dispatch }) => {
  const id = getRandomId();
  const alert: Alert = {
    id,
    type: type || 'default',
    persistent: !!persistent,
    message,
  };

  if (!alert.persistent) {
    if (timeout && timeout < 100) {
      timeout = 500;
    }
    setTimeout(() => {
      dispatch(closeAlert({ alertId: alert.id }));
    }, timeout || getConfig().DEFAULT_ALERT_TIMEOUT);
  }
  return { alert };
});

export const AlertsActions = {
  openAlert,
  closeAlert,
};
