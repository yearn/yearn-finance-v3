import { FC, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { AppActions, RouteActions, WalletActions } from '@store';

import { useAppTranslation, useAppDispatch, useAppSelector } from '@hooks';
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
  const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const location = useLocation();
  const selectedAddress = useAppSelector(({ wallet }) => wallet.selectedAddress);
  // const path = useAppSelector(({ route }) => route.path);
  const path = location.pathname.toLowerCase().split('/')[1];

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
        <Navbar
          title={t(`navigation.${path}`)}
          walletAddress={selectedAddress}
          onWalletClick={() => dispatch(WalletActions.walletSelect())}
        />
        {children}
        <Footer />
      </Content>
    </Box>
  );
};
