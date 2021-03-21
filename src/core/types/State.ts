import { Theme } from './Settings';

export interface RootState {
  app: AppState;
  theme: ThemeState;
}

export interface AppState {
  isInitialized: boolean;
}

export interface ThemeState {
  current: Theme;
}
