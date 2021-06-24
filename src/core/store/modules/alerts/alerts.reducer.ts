import { createReducer } from '@reduxjs/toolkit';
import { AlertsState } from '@types';
import { AlertsActions } from './alerts.actions';

export const alertsInitialState: AlertsState = {
  alertsList: [],
  lastId: 0,
};

const { openAlert, closeAlert } = AlertsActions;

const alertsReducer = createReducer(alertsInitialState, (builder) => {
  builder
    .addCase(openAlert.fulfilled, (state, { payload: { alert } }) => {
      state.lastId = alert.id;
      state.alertsList.push(alert);
    })
    .addCase(closeAlert.fulfilled, (state, { payload: { alertId } }) => {
      const alertIndex = state.alertsList.findIndex((alert) => alert.id === alertId);

      if (alertIndex > -1) {
        state.alertsList.splice(alertIndex, 1);
      }
    });
});

export default alertsReducer;
