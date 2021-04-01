import { FC, createContext } from 'react';

import { useToggler } from '@hooks';

const initialState = {
  isOpen: false,
  isDisabled: true,
  toggle: () => {},
  open: () => {},
  close: () => {},
};

export const SideMenuContext = createContext(initialState);

export const SideMenuContextProvider: FC = ({ children }) => {
  const { isOpen, isDisabled, toggle, open, close } = useToggler({ opened: false });

  return (
    <SideMenuContext.Provider value={{ isOpen, isDisabled, toggle, open, close }}>{children}</SideMenuContext.Provider>
  );
};
