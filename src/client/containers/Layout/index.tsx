import { FC, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import {
  AppActions,
  RouteActions,
  TokensActions,
  WalletActions,
  VaultsActions,
  LabsActions,
  IronBankActions,
  VaultsSelectors,
  LabsSelectors,
  IronBankSelectors,
  WalletSelectors,
  TokensSelectors,
  NetworkSelectors,
  AppSelectors,
  ModalSelectors,
  SettingsSelectors,
  AlertsActions,
  NetworkActions,
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
import { isValidAddress } from '@utils';
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
  const history = useHistory();
  const previousAddress = usePrevious(selectedAddress);
  const previousNetwork = usePrevious(currentNetwork);

  let isFetching = false;
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
      isFetching) &&
    !activeModal;

  // const path = useAppSelector(({ route }) => route.path);
  const path = location.pathname.toLowerCase().split('/')[1] as Route;

  // TODO This is only assetAddress on the vault page
  const assetAddress: string | undefined = location.pathname.split('/')[2];

  useEffect(() => {
    dispatch(AppActions.initApp());
  }, []);

  // TODO: MOVE THIS LOGIC TO THUNKS
  useEffect(() => {
    dispatch(RouteActions.changeRoute({ path: location.pathname }));
    fetchData(path);
    if (selectedAddress) fetchUserData(path);
  }, [location]);

  // TODO: MOVE THIS LOGIC TO THUNKS
  useEffect(() => {
    if (previousAddress) clearUserData();
    if (selectedAddress) fetchUserData(path);
  }, [selectedAddress]);

  useEffect(() => {
    if (previousNetwork) clearData();
    if (selectedAddress) clearUserData();
    dispatch(TokensActions.getTokens());
    fetchData(path);
    if (selectedAddress) fetchUserData(path);
  }, [currentNetwork]);

  function clearUserData() {
    dispatch(TokensActions.clearUserTokenState());
    dispatch(VaultsActions.clearUserData());
    dispatch(LabsActions.clearUserData());
    dispatch(IronBankActions.clearUserData());
  }

  function clearData() {
    dispatch(TokensActions.clearTokensData());
    dispatch(VaultsActions.clearVaultsData());
    dispatch(LabsActions.clearLabsData());
    dispatch(IronBankActions.clearIronBankData());
  }

  async function fetchData(path: Route) {
    if (isFetching) return;
    isFetching = true;

    if (path === 'vault') {
      if (!assetAddress || !isValidAddress(assetAddress)) {
        dispatch(AlertsActions.openAlert({ message: 'INVALID_ADDRESS', type: 'error' }));
        history.push('/home');
        return;
      }
      dispatch(VaultsActions.setSelectedVaultAddress({ vaultAddress: assetAddress }));
    }
    await dispatch(AppActions.getAppData({ route: path, addresses: assetAddress ? [assetAddress] : undefined }));

    isFetching = false;
  }

  async function fetchUserData(path: Route) {
    if (path === 'vault' && (!assetAddress || !isValidAddress(assetAddress))) return;
    await dispatch(AppActions.getUserAppData({ route: path, addresses: assetAddress ? [assetAddress] : undefined }));
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
