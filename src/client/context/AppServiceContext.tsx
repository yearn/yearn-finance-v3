import { FC, createContext } from 'react';

import { ServiceContainer } from '@types';

export const AppServiceContext = createContext<ServiceContainer | undefined>(undefined);

interface AppServiceContextProviderProps {
  services: ServiceContainer;
}

export const AppServiceContextProvider: FC<AppServiceContextProviderProps> = ({ children, services }) => {
  return <AppServiceContext.Provider value={services}>{children}</AppServiceContext.Provider>;
};
