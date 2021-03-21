import { Theme } from './Settings';

export interface RootState {
  app: AppState;
  route: RouteState;
  theme: ThemeState;
}

export interface AppState {
  isInitialized: boolean;
}

export interface RouteState {
  path: string | undefined;
}

export interface ThemeState {
  current: Theme;
}
