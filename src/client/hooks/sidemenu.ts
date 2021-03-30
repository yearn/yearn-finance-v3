import { useState, useEffect } from 'react';

export interface Sidemenu {
  open: boolean;
  disabled: boolean;
  toggle: () => void;
}

export const useSideMenu = () => {
  const [showSidebar, setShowSidebar] = useState(true);

  const sideMenu = React.useContext(SideMenuContext);
  const { enable, disable, close } = sideMenu;

  React.useEffect(() => {
    enable();

    return () => {
      disable();
      close();
    };
  }, []);

  return sideMenu;
};
