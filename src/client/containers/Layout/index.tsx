import { FC, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { AppActions, RouteActions, WalletActions } from '@store';
import { useAppDispatch, useAppSelector } from '@hooks';
import { Navigation } from '@components/app';
import { Box } from '@components/common';

const Content = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  padding-top: ${(props) => props.theme.navbar.height};
`;

export const Layout: FC = ({ children }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const selectedAddress = useAppSelector(({ wallet }) => wallet.selectedAddress);
  const transparentNavbar = location.pathname === '/';

  useEffect(() => {
    dispatch(AppActions.initApp());
  }, []);

  useEffect(() => {
    dispatch(RouteActions.changeRoute({ path: location.pathname }));
  }, [location]);

  return (
    <Box display="flex" flexDirection="column" flex="1">
      <Navigation
        transparentNavbar={transparentNavbar}
        walletAddress={selectedAddress ?? undefined}
        onWalletClick={() => dispatch(WalletActions.walletSelect())}
      />
      <Content>{children}</Content>
    </Box>
  );
};
