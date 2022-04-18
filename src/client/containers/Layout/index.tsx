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
  SettingsSelectors,
  ModalsActions,
  ModalSelectors,
  NetworkActions,
  AlertsActions,
  VaultsSelectors,
} from '@store';
import { useAppTranslation, useAppDispatch, useAppSelector, useWindowDimensions, usePrevious } from '@hooks';
import { Navigation, Navbar, Footer } from '@components/app';
import { Modals, Alerts, NotificationBanner } from '@containers';
import { getConfig } from '@config';
import { Network, Route } from '@types';
import { device } from '@themes/default';

const contentSeparation = '1.6rem';

/*
  Some css magic to make a performance upgrade when the background is an image:
  background-attachment: fixed causes a paint operation every time the user scrolls.
  This is because the page must reposition the content as well as the background image so it looks like its holding still
  This causes a re-render of all child components since they have to be moved.
  Setting the background on a before element enables us to give all the styles into its own element so it moves independent from all the other elements.
  This basically wraps all gpu-heavy operations behind just one element instead of being applied to a pseudo-class
*/
const StyledLayout = styled.div`
  display: flex;
  justify-content: center;
  flex: 1;
  padding: ${({ theme }) => theme.card.padding};

  @media ${device.mobile} {
    padding: ${({ theme }) => theme.layoutPadding};
  }

  ${({ theme }) =>
    theme.background &&
    `
      &::before {
        content: '';
        background-image: url(${theme.background.image});
        background-repeat: no-repeat;
        background-position: ${theme.background.position ?? 'center'};
        background-size: cover;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
      }
  `}
`;

const Content = styled.div<{ collapsedSidebar?: boolean; useTabbar?: boolean }>`
  display: grid;
  grid-gap: ${({ theme }) => theme.layoutPadding};
  grid-template-rows: auto 1fr auto;
  width: 100%;
  max-width: ${({ theme }) => theme.globalMaxWidth};
  min-height: 100%;
  transition: padding-left ${({ theme }) => theme.sideBar.animation};

  padding-left: ${(props) => {
    if (!props.useTabbar) {
      // If we are not using tabbar mobile and navbar is collapsed
      if (props.collapsedSidebar) {
        return `calc(${props.theme.sideBar.collapsedWidth} + ${contentSeparation})`;
      } else {
        return `calc(${props.theme.sideBar.width} + ${contentSeparation})`;
      }
    }
  }};

  // NOTE if we are using tabbar mobile
  padding-bottom: ${(props) => props.useTabbar && `calc(${props.theme.tabbar.height} + ${contentSeparation})`};
`;

export const Layout: FC = ({ children }) => {
  const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { SUPPORTED_NETWORKS } = getConfig();
  const { isMobile } = useWindowDimensions();
  const selectedAddress = useAppSelector(WalletSelectors.selectSelectedAddress);
  const addressEnsName = useAppSelector(WalletSelectors.selectAddressEnsName);
  const currentNetwork = useAppSelector(NetworkSelectors.selectCurrentNetwork);
  const activeModal = useAppSelector(ModalSelectors.selectActiveModal);
  const collapsedSidebar = useAppSelector(SettingsSelectors.selectSidebarCollapsed);
  const previousAddress = usePrevious(selectedAddress);
  const previousNetwork = usePrevious(currentNetwork);
  const selectedVault = useAppSelector(VaultsSelectors.selectSelectedVault);
  // const path = useAppSelector(({ route }) => route.path);
  const path = location.pathname.toLowerCase().split('/')[1] as Route;

  let vaultName;
  // TODO Add lab details route when its added the view
  if (path === 'vault') {
    vaultName = selectedVault?.displayName;
  }

  // TODO This is only assetAddress on the vault page
  const assetAddress: string | undefined = location.pathname.split('/')[2];

  // Used to check zapper api
  const { ZAPPER_API_KEY } = getConfig();

  useEffect(() => {
    dispatch(AppActions.initApp());

    // NOTE Test zapper API
    const url = 'https://api.zapper.fi/v1/prices';
    const params = new URLSearchParams({ api_key: ZAPPER_API_KEY ?? '' });

    fetch(`${url}?${params}`).catch((error) => {
      dispatch(
        AlertsActions.openAlert({
          message:
            'Zapper is currently experiencing technical issues and this might impact your experience at Yearn. We are sorry for the inconveniences and the problems should be resolved soon.',
          type: 'warning',
          persistent: true,
        })
      );
    });
  }, []);

  useEffect(() => {
    dispatch(RouteActions.changeRoute({ path: location.pathname }));
    fetchAppData(currentNetwork, path);
    if (selectedAddress) fetchUserData(currentNetwork, path);
  }, [location]);

  useEffect(() => {
    if (previousAddress) dispatch(AppActions.clearUserAppData());
    // if (previousAddress) dispatch(UserActions.clearNftBalance());
    if (selectedAddress) fetchUserData(currentNetwork, path);
    // if (selectedAddress) dispatch(UserActions.getNftBalance());
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
      <NotificationBanner />
      <Alerts />
      <Modals />
      <Navigation />

      <Content collapsedSidebar={collapsedSidebar} useTabbar={isMobile}>
        <Navbar
          title={t(`navigation.${path}`)}
          subTitle={vaultName}
          walletAddress={selectedAddress}
          addressEnsName={addressEnsName}
          onWalletClick={() => dispatch(WalletActions.walletSelect({ network: currentNetwork }))}
          selectedNetwork={currentNetwork}
          networkOptions={SUPPORTED_NETWORKS}
          onNetworkChange={(network) => dispatch(NetworkActions.changeNetwork({ network: network as Network }))}
        />

        {children}

        <Footer />
      </Content>
    </StyledLayout>
  );
};
