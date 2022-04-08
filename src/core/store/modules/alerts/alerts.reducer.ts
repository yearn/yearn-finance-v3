import { createReducer } from '@reduxjs/toolkit';

import { AlertsState } from '@types';

import { AlertsActions } from './alerts.actions';

export const alertsInitialState: AlertsState = {
  alertsList: [],
};

const { openAlert, closeAlert } = AlertsActions;

const alertsReducer = createReducer(alertsInitialState, (builder) => {
  builder
    .addCase(openAlert.fulfilled, (state, { payload: { alert } }) => {
      state.alertsList.push(alert);
    })
    .addCase(closeAlert, (state, { payload: { alertId } }) => {
      const alertIndex = state.alertsList.findIndex((alert) => alert.id === alertId);

      if (alertIndex > -1) {
        state.alertsList.splice(alertIndex, 1);
      }
    });
});

export default alertsReducer;
