import { FC, createContext } from 'react';

import { ContextContainer } from '@types';

export const AppContext = createContext<ContextContainer | undefined>(undefined);

interface AppContextProviderProps {
  context: ContextContainer;
}

export const AppContextProvider: FC<AppContextProviderProps> = ({ children, context }) => {
  return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
};
