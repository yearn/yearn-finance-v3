import { FC, createContext } from 'react';

import { useToggler } from '@hooks';

const initialState = {
  isOpen: false,
  isDisabled: true,
  toggle: () => {},
  open: () => {},
  close: () => {},
};

export const NavSideMenuContext = createContext(initialState);

export const NavSideMenuContextProvider: FC = ({ children }) => {
  const { isOpen, isDisabled, toggle, open, close } = useToggler({ opened: false });

  return (
    <NavSideMenuContext.Provider value={{ isOpen, isDisabled, toggle, open, close }}>
      {children}
    </NavSideMenuContext.Provider>
  );
};
