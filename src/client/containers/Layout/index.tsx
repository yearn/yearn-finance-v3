import { FC, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import {
  AppActions,
  RouteActions,
  WalletActions,
  TokensActions,
  VaultsActions,
  IronBankActions,
  WalletSelectors,
  SettingsSelectors,
} from '@store';

import { useAppTranslation, useAppDispatch, useAppSelector } from '@hooks';
import { Navigation, Navbar, Footer } from '@components/app';
import { Modals, Alerts } from '@containers';

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
  const selectedAddress = useAppSelector(WalletSelectors.selectSelectedAddress);
  const collapsedSidebar = useAppSelector(SettingsSelectors.selectSidebarCollapsed);

  // const path = useAppSelector(({ route }) => route.path);
  const path = location.pathname.toLowerCase().split('/')[1];

  useEffect(() => {
    dispatch(AppActions.initApp());
  }, []);

  // TODO: MOVE THIS LOGIC TO THUNKS
  useEffect(() => {
    dispatch(RouteActions.changeRoute({ path: location.pathname }));
    switch (path) {
      case 'home':
        dispatch(VaultsActions.initiateSaveVaults());
        break;
      case 'vaults':
        dispatch(VaultsActions.initiateSaveVaults());
        break;
      case 'wallet':
        dispatch(VaultsActions.initiateSaveVaults());
        break;
      case 'ironbank':
        dispatch(IronBankActions.initiateIronBank());
        break;
      default:
        break;
    }
  }, [location]);

  // TODO: MOVE THIS LOGIC TO THUNKS
  useEffect(() => {
    if (selectedAddress) {
      switch (path) {
        default:
          // clean old data
          dispatch(TokensActions.clearUserTokenState());
          dispatch(VaultsActions.clearUserData());
          dispatch(IronBankActions.clearUserData());

          // fetch new data
          dispatch(TokensActions.getUserTokens({}));
          dispatch(VaultsActions.getUserVaultsPositions({}));
          dispatch(IronBankActions.getUserMarketsPositions({}));
          dispatch(IronBankActions.getUserMarketsMetadata({}));
          break;
      }
    }
  }, [selectedAddress]);

  return (
    <StyledLayout>
      <Alerts />
      <Modals />
      <Navigation />

      <Content collapsedSidebar={collapsedSidebar}>
        <Navbar
          title={t(`navigation.${path}`)}
          walletAddress={selectedAddress}
          onWalletClick={() => dispatch(WalletActions.walletSelect())}
        />
        {children}
        <Footer />
      </Content>
    </StyledLayout>
  );
};
