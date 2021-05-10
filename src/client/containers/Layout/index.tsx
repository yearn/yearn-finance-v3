import { FC, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

// import { WalletActions } from '@store';
// import { useAppSelector } from '@hooks';
import { AppActions, RouteActions } from '@store';
import { useAppDispatch } from '@hooks';
import { Navigation, Footer, Navbar } from '@components/app';
import { Box } from '@components/common';

const Content = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  padding-left: ${({ theme }) => theme.sideBar.width};
  min-height: 100%;
`;

export const Layout: FC = ({ children }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  // const selectedAddress = useAppSelector(({ wallet }) => wallet.selectedAddress);
  // const transparentNavbar = location.pathname === '/';

  useEffect(() => {
    dispatch(AppActions.initApp());
  }, []);

  useEffect(() => {
    dispatch(RouteActions.changeRoute({ path: location.pathname }));
  }, [location]);

  return (
    <Box display="flex" flex="1">
      <Navigation />

      <Content>
        <Navbar />
        {children}
        <Footer />
      </Content>
    </Box>
  );
};
