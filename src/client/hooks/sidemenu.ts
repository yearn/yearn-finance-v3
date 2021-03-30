import { useState, useEffect } from 'react';

export interface Sidemenu {
  open: boolean;
  disabled: boolean;
  toggle: () => void;
}

export const useSideMenu = (initialValue = false) => {
  const [showSidebar, setShowSidebar] = useState(initialValue);

  const isOpen = showSidebar;
  const toggle = () => setShowSidebar((currentState) => !currentState);
  const close = () => setShowSidebar(false);
  const open = () => setShowSidebar(true);

  // const sideMenu = React.useContext(SideMenuContext);
  // const { enable, disable, close } = sideMenu;

  // useEffect(() => {
  //   enable();

  //   return () => {
  //     disable();
  //     close();
  //   };
  // }, []);

  return { isOpen, toggle, open, close };
};
