import { FC, createContext } from 'react';

import { ContextContainer } from '@types';

export const AppContext = createContext<Partial<ContextContainer>>({});

interface AppContextProviderProps {
  context: ContextContainer;
}

export const ContextProvider: FC<AppContextProviderProps> = ({
  children,
  context,
}) => {
  return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
};
