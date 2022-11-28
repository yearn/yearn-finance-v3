import { FC, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import {
  AppActions,
  RouteActions,
  TokensActions,
  WalletActions,
  WalletSelectors,
  NetworkSelectors,
  ModalsActions,
  ModalSelectors,
} from '@store';
import { useAppDispatch, useAppSelector, usePrevious } from '@hooks';
import { Modals, Alerts } from '@containers';
import { Header } from '@components/app';
import { device } from '@themes/default';
import { Network, Route } from '@types';

const StyledLayout = styled.div`
  display: flex;
  justify-content: center;
  flex: 1;
  padding: ${({ theme }) => theme.layoutPadding};

  @media ${device.mobile} {
    padding: ${({ theme }) => theme.layoutPadding} 0;
  }
`;

const Content = styled.div<{ collapsedSidebar?: boolean; useTabbar?: boolean; padBottom?: boolean }>`
  display: grid;
  grid-gap: ${({ theme }) => theme.layoutPadding};
  grid-template-rows: auto 1fr auto;
  width: 100%;
  max-width: ${({ theme }) => theme.globalMaxWidth};
  min-height: 100%;
  transition: padding-left ${({ theme }) => theme.sideBar.animation};
`;

export const LayoutAlternate: FC = ({ children }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const selectedAddress = useAppSelector(WalletSelectors.selectSelectedAddress);
  const addressEnsName = useAppSelector(WalletSelectors.selectAddressEnsName);
  const currentNetwork = useAppSelector(NetworkSelectors.selectCurrentNetwork);
  const activeModal = useAppSelector(ModalSelectors.selectActiveModal);
  const previousAddress = usePrevious(selectedAddress);
  const previousNetwork = usePrevious(currentNetwork);

  const path = location.pathname.toLowerCase().split('/')[1] as Route;
  const assetAddress: string | undefined = location.pathname.split('/')[2];

  useEffect(() => {
    dispatch(AppActions.initApp());
  }, []);

  useEffect(() => {
    dispatch(RouteActions.changeRoute({ path: location.pathname }));
    fetchAppData(currentNetwork, path);
    if (selectedAddress) fetchUserData(currentNetwork, path);
  }, [location]);

  useEffect(() => {
    if (previousAddress) dispatch(AppActions.clearUserAppData());
    if (selectedAddress) fetchUserData(currentNetwork, path);
  }, [selectedAddress]);

  useEffect(() => {
    if (activeModal) dispatch(ModalsActions.closeModal());
    if (previousNetwork) dispatch(AppActions.clearAppData());
    if (selectedAddress) dispatch(AppActions.clearUserAppData());
    dispatch(TokensActions.getTokens());
    fetchAppData(currentNetwork, path);
    if (selectedAddress) fetchUserData(currentNetwork, path);
  }, [currentNetwork]);

  function fetchAppData(network: Network, path: Route) {
    dispatch(
      AppActions.getAppData({
        network,
        route: path,
        addresses: assetAddress ? [assetAddress] : undefined,
      })
    );
  }

  function fetchUserData(network: Network, path: Route) {
    dispatch(
      AppActions.getUserAppData({
        network,
        route: path,
        addresses: assetAddress ? [assetAddress] : undefined,
      })
    );
  }

  return (
    <StyledLayout>
      <Alerts />
      <Modals />

      <Content>
        <Header
          walletAddress={selectedAddress}
          addressEnsName={addressEnsName}
          onWalletClick={() => dispatch(WalletActions.walletSelect({ network: currentNetwork }))}
        />
        {children}
      </Content>
    </StyledLayout>
  );
};
