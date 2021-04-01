import { useState } from 'react';

export interface UseTogglerProps {
  opened?: boolean;
}

export const useToggler = ({ opened = false }: UseTogglerProps) => {
  const [isOpen, setIsOpen] = useState(opened);

  const isDisabled = !isOpen;
  const toggle = () => setIsOpen((currentState) => !currentState);
  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  return { isOpen, isDisabled, toggle, open, close };
};
