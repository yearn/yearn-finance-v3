import { FC, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { AppActions, RouteActions, WalletActions, SettingsSelectors } from '@store';

import { useAppTranslation, useAppDispatch, useAppSelector } from '@hooks';
import { Navigation, Navbar } from '@components/app';
import { Modals } from '@containers';

const contentSeparation = '1.6rem';

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
  transition: padding-left ${({ theme }) => theme.sideBar.animation};

  padding-left: ${(props) =>
    props.collapsedSidebar
      ? `calc(${props.theme.sideBar.collapsedWidth} + ${contentSeparation})`
      : `calc(${props.theme.sideBar.width} + ${contentSeparation})`};
`;

export const Layout: FC = ({ children }) => {
  const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const location = useLocation();
  const selectedAddress = useAppSelector(({ wallet }) => wallet.selectedAddress);
  const collapsedSidebar = useAppSelector(SettingsSelectors.selectSidebarCollapsed);

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
      <Modals />
      <Navigation />

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
