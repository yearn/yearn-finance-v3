import { FC, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { AppActions, RouteActions, WalletActions } from '@store';

import { useAppTranslation, useAppDispatch, useAppSelector } from '@hooks';
import { Navigation, Footer, Navbar } from '@components/app';

const StyledLayout = styled.div`
  display: flex;
  flex: 1;
  padding: ${({ theme }) => theme.layoutPadding};
`;

const Content = styled.div<{ collapsedSidebar?: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  min-height: 100%;

  padding-left: ${(props) =>
    props.collapsedSidebar
      ? `calc(${props.theme.sideBar.collapsedWidth} + 1.2rem)`
      : `calc(${props.theme.sideBar.width} + 1.2rem)`};
`;

export const Layout: FC = ({ children }) => {
  const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const location = useLocation();
  const selectedAddress = useAppSelector(({ wallet }) => wallet.selectedAddress);

  // TODO collapsedSidebar should be in settingsState
  const collapsedSidebar = false;
  // const path = useAppSelector(({ route }) => route.path);
  const path = location.pathname.toLowerCase().split('/')[1];

  useEffect(() => {
    dispatch(AppActions.initApp());
  }, []);

  useEffect(() => {
    dispatch(RouteActions.changeRoute({ path: location.pathname }));
  }, [location]);

  return (
    <StyledLayout>
      <Navigation collapsedSidebar={collapsedSidebar} />

      <Content collapsedSidebar={collapsedSidebar}>
        <Navbar
          title={t(`navigation.${path}`)}
          walletAddress={selectedAddress}
          onWalletClick={() => dispatch(WalletActions.walletSelect())}
        />
        {children}
        {/* <Footer /> */}
      </Content>
    </StyledLayout>
  );
};
