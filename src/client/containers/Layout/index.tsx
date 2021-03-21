import { FC, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { initApp, changeRoute } from '@store';
import { useAppDispatch } from '@hooks';
import { Box } from '@components/common';

export const Layout: FC = ({ children }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(initApp());
  }, []);

  useEffect(() => {
    dispatch(changeRoute(location.pathname));
  }, [location]);

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      Menu
      {children}
    </Box>
  );
};
