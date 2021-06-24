import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkAPI } from '@frameworks/redux';
import { Alert, AlertTypes } from '@types';
import { getConfig } from '@config';

export interface AlertProps {
  message: string;
  type?: AlertTypes;
  persistent?: boolean;
  timeout?: number;
}

const closeAlert = createAction<{ alertId: number }>('alerts/closeAlert');

const openAlert = createAsyncThunk<
  { alert: Alert },
  { message: string; type?: AlertTypes; persistent?: boolean; timeout?: number },
  ThunkAPI
>('alerts/openAlert', async ({ message, type, persistent, timeout }, { getState, dispatch }) => {
  const alert: Alert = {
    id: (getState().alerts.lastId || 0) + 1,
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
