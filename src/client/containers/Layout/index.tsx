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
  WalletSelectors,
  SettingsSelectors,
  AlertsActions,
} from '@store';

import { useAppTranslation, useAppDispatch, useAppSelector } from '@hooks';
import { Navigation, Navbar, Footer } from '@components/app';
import { Modals, Alerts } from '@containers';
import { isValidAddress } from '../../../utils';

const contentSeparation = '1.6rem';

const StyledLayout = styled.div`
  display: flex;
  justify-content: center;
  flex: 1;
  padding: ${({ theme }) => theme.layoutPadding};
`;

const Content = styled.div<{ collapsedSidebar?: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: ${({ theme }) => theme.globalMaxWidth};
  // flex: 1;
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
  const addressEnsName = useAppSelector(WalletSelectors.selectAddressEnsName);
  const collapsedSidebar = useAppSelector(SettingsSelectors.selectSidebarCollapsed);
  const history = useHistory();

  // const path = useAppSelector(({ route }) => route.path);
  const path = location.pathname.toLowerCase().split('/')[1];

  // TODO This is only assetAddress on the vault page
  const assetAddress: string | undefined = location.pathname.split('/')[2];

  useEffect(() => {
    dispatch(AppActions.initApp());
  }, []);

  // TODO: MOVE THIS LOGIC TO THUNKS
  useEffect(() => {
    dispatch(RouteActions.changeRoute({ path: location.pathname }));
    switch (path) {
      case 'home':
        dispatch(LabsActions.initiateLabs());
        break;
      case 'wallet':
        dispatch(VaultsActions.initiateSaveVaults());
        break;
      case 'vaults':
        dispatch(VaultsActions.initiateSaveVaults());
        break;
      case 'vault':
        if (!assetAddress) break;
        if (!isValidAddress(assetAddress)) {
          dispatch(AlertsActions.openAlert({ message: 'INVALID_ADDRESS', type: 'error' }));
          history.push('/home');
          break;
        }
        dispatch(VaultsActions.setSelectedVaultAddress({ vaultAddress: assetAddress }));
        dispatch(VaultsActions.getVaults({ addresses: [assetAddress] }));
        break;
      case 'labs':
        dispatch(LabsActions.initiateLabs());
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
    clearUserData();
    if (selectedAddress) {
      fetchUserData(path);
    }
  }, [selectedAddress]);

  useEffect(() => {
    if (selectedAddress) {
      fetchUserData(path);
    }
  }, [location]);

  function clearUserData() {
    dispatch(TokensActions.clearUserTokenState());
    dispatch(VaultsActions.clearUserData());
    dispatch(LabsActions.clearUserData());
    dispatch(IronBankActions.clearUserData());
  }

  function fetchUserData(path: string) {
    dispatch(TokensActions.getUserTokens({})); // always fetch all user tokens
    switch (path) {
      case 'home':
        dispatch(VaultsActions.getUserVaultsSummary());
        dispatch(LabsActions.getUserLabsPositions({}));

        dispatch(IronBankActions.getIronBankSummary()); // use only this when lens summary calculation fixed
        dispatch(IronBankActions.getUserMarketsPositions({})); // remove this when lens summary calculation fixed
        dispatch(IronBankActions.getUserMarketsMetadata({})); // remove this when lens summary calculation fixed
        break;
      case 'wallet':
        dispatch(VaultsActions.getUserVaultsPositions({}));
        break;
      case 'vaults':
        dispatch(VaultsActions.getUserVaultsSummary());
        dispatch(VaultsActions.getUserVaultsPositions({}));
        dispatch(VaultsActions.getUserVaultsMetadata({}));
        break;
      case 'vault':
        if (!assetAddress || !isValidAddress(assetAddress)) break;
        dispatch(VaultsActions.getUserVaultsSummary());
        dispatch(VaultsActions.getUserVaultsPositions({ vaultAddresses: [assetAddress] }));
        dispatch(VaultsActions.getUserVaultsMetadata({ vaultsAddresses: [assetAddress] }));
        break;
      case 'labs':
        dispatch(LabsActions.getUserLabsPositions({}));
        break;
      case 'ironbank':
        dispatch(IronBankActions.getIronBankSummary());
        dispatch(IronBankActions.getUserMarketsPositions({}));
        dispatch(IronBankActions.getUserMarketsMetadata({}));
        break;
      default:
        break;
    }
  }

  return (
    <StyledLayout>
      <Alerts />
      <Modals />
      <Navigation />

      <Content collapsedSidebar={collapsedSidebar}>
        <Navbar
          title={t(`navigation.${path}`)}
          walletAddress={selectedAddress}
          addressEnsName={addressEnsName}
          onWalletClick={() => dispatch(WalletActions.walletSelect())}
        />
        {children}
        <Footer />
      </Content>
    </StyledLayout>
  );
};
