import { FC, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { initApp, changeRoute, walletSelect } from '@store';
import { useAppDispatch, useAppSelector } from '@hooks';
import { AppMenu } from '@components/app';
import { Box } from '@components/common';

export const Layout: FC = ({ children }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const selectedAddress = useAppSelector(({ wallet }) => wallet.selectedAddress);

  useEffect(() => {
    dispatch(initApp());
  }, []);

  useEffect(() => {
    dispatch(changeRoute({ path: location.pathname }));
  }, [location]);

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <AppMenu walletAddress={selectedAddress ?? undefined} onWalletClick={() => dispatch(walletSelect())} />
      {children}
    </Box>
  );
};
