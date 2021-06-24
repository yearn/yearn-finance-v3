import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkAPI } from '@frameworks/redux';
import { Alert, AlertTypes } from '@types';
import { getConfig } from '@config';

export interface AlertProps {
  message: string;
  type?: AlertTypes;
  persistent?: boolean;
  timeout?: number;
}

// const openAlert = createAction<{ modalName: ModalName; modalProps?: any }>('modals/openModal');
// const closeAlert = createAction('modals/closeModal');

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

const closeAlert = createAsyncThunk<{ alertId: number }, { alertId: number }, ThunkAPI>(
  'alerts/closeAlert',
  async ({ alertId }) => {
    return { alertId };
  }
);

export const AlertsActions = {
  openAlert,
  closeAlert,
};
