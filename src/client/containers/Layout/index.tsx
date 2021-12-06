import { FC, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import {
  AppActions,
  RouteActions,
  TokensActions,
  WalletActions,
  VaultsSelectors,
  LabsSelectors,
  IronBankSelectors,
  WalletSelectors,
  TokensSelectors,
  NetworkSelectors,
  AppSelectors,
  ModalSelectors,
  SettingsSelectors,
  NetworkActions,
  UserActions,
} from '@store';
import {
  useAppTranslation,
  useAppDispatch,
  useAppSelector,
  useWindowDimensions,
  useIsMounting,
  usePrevious,
} from '@hooks';
import { Navigation, Navbar, Footer } from '@components/app';
import { Modals, Alerts } from '@containers';
import { getConfig } from '@config';
import { Network, Route } from '@types';

const contentSeparation = '1.6rem';

const StyledLayout = styled.div`
  display: flex;
  justify-content: center;
  flex: 1;
  padding: ${({ theme }) => theme.layoutPadding};

  ${({ theme }) =>
    theme.background &&
    `
      background-size: cover;
      background-image: url(${theme.background.image});
      background-position: ${theme.background.position ?? 'center'};
      background-repeat: no-repeat;
      background-attachment: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
  `}
`;

const Content = styled.div<{ collapsedSidebar?: boolean; useTabbar?: boolean }>`
  display: flex;
  flex-direction: column;
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
  const isMounting = useIsMounting();
  const location = useLocation();
  const { SUPPORTED_NETWORKS } = getConfig();
  const { isMobile } = useWindowDimensions();
  const selectedAddress = useAppSelector(WalletSelectors.selectSelectedAddress);
  const addressEnsName = useAppSelector(WalletSelectors.selectAddressEnsName);
  const currentNetwork = useAppSelector(NetworkSelectors.selectCurrentNetwork);
  const collapsedSidebar = useAppSelector(SettingsSelectors.selectSidebarCollapsed);
  const previousAddress = usePrevious(selectedAddress);
  const previousNetwork = usePrevious(currentNetwork);

  let isFetchingAppData = false;
  let isFetchingUserData = false;
  const activeModal = useAppSelector(ModalSelectors.selectActiveModal);
  const appStatus = useAppSelector(AppSelectors.selectAppStatus);
  const tokensStatus = useAppSelector(TokensSelectors.selectWalletTokensStatus);
  const vaultsStatus = useAppSelector(VaultsSelectors.selectVaultsStatus);
  const labsStatus = useAppSelector(LabsSelectors.selectLabsStatus);
  const ironBankStatus = useAppSelector(IronBankSelectors.selectIronBankStatus);
  const generalLoading =
    (appStatus.loading ||
      tokensStatus.loading ||
      vaultsStatus.loading ||
      labsStatus.loading ||
      ironBankStatus.loading ||
      isMounting ||
      isFetchingAppData) &&
    !activeModal;

  // const path = useAppSelector(({ route }) => route.path);
  const path = location.pathname.toLowerCase().split('/')[1] as Route;

  // TODO This is only assetAddress on the vault page
  const assetAddress: string | undefined = location.pathname.split('/')[2];

  useEffect(() => {
    dispatch(AppActions.initApp());
  }, []);

  useEffect(() => {
    dispatch(RouteActions.changeRoute({ path: location.pathname }));
    fetchAppData(path);
    if (selectedAddress) fetchUserData(path);
  }, [location]);

  useEffect(() => {
    if (previousAddress) dispatch(AppActions.clearUserAppData());
    if (previousAddress) dispatch(UserActions.clearNftBalance());
    if (selectedAddress) fetchUserData(path);
    if (selectedAddress) dispatch(UserActions.getNftBalance());
  }, [selectedAddress]);

  useEffect(() => {
    if (previousNetwork) dispatch(AppActions.clearAppData());
    if (selectedAddress) dispatch(AppActions.clearUserAppData());
    dispatch(TokensActions.getTokens());
    fetchAppData(path);
    if (selectedAddress) fetchUserData(path);
  }, [currentNetwork]);

  async function fetchAppData(path: Route) {
    if (isFetchingAppData) return;
    isFetchingAppData = true;
    await dispatch(AppActions.getAppData({ route: path, addresses: assetAddress ? [assetAddress] : undefined }));
    isFetchingAppData = false;
  }

  async function fetchUserData(path: Route) {
    if (isFetchingUserData) return;
    isFetchingUserData = true;
    await dispatch(AppActions.getUserAppData({ route: path, addresses: assetAddress ? [assetAddress] : undefined }));
    isFetchingUserData = false;
  }

  return (
    <StyledLayout>
      <Alerts />
      <Modals />
      <Navigation />

      <Content collapsedSidebar={collapsedSidebar} useTabbar={isMobile}>
        <Navbar
          title={t(`navigation.${path}`)}
          walletAddress={selectedAddress}
          addressEnsName={addressEnsName}
          onWalletClick={() => dispatch(WalletActions.walletSelect({ network: currentNetwork }))}
          selectedNetwork={currentNetwork}
          networkOptions={SUPPORTED_NETWORKS}
          onNetworkChange={(network) => dispatch(NetworkActions.changeNetwork({ network: network as Network }))}
          disableNetworkChange={generalLoading}
        />
        {children}
        <Footer />
      </Content>
    </StyledLayout>
  );
};
