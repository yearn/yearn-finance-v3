import { FC, createContext } from 'react';

import { useToggler } from '@hooks';

const initialState = {
  isOpen: false,
  isDisabled: true,
  toggle: () => {},
  open: () => {},
  close: () => {},
};

export const BladeContext = createContext(initialState);

export const BladeContextProvider: FC = ({ children }) => {
  const { isOpen, isDisabled, toggle, open, close } = useToggler({ opened: false });

  return <BladeContext.Provider value={{ isOpen, isDisabled, toggle, open, close }}>{children}</BladeContext.Provider>;
};
