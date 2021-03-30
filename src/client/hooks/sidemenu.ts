import { useState } from 'react';

export interface Sidemenu {
  open: boolean;
  disabled: boolean;
  toggle: () => void;
}
export interface InitialSidemenuProps {
  opened?: boolean;
}

export const useSideMenu = ({ opened = false }: InitialSidemenuProps) => {
  const [showSidebar, setShowSidebar] = useState(opened);

  const isOpen = showSidebar;
  const isDisabled = showSidebar;
  const toggle = () => setShowSidebar((currentState) => !currentState);
  const close = () => setShowSidebar(false);
  const open = () => setShowSidebar(true);

  return { isOpen, isDisabled, toggle, open, close };
};
