import { RootState } from '@types';

const selectAlerts = (state: RootState) => state.alerts.alertsList;

export const AlertsSelectors = {
  selectAlerts,
};
