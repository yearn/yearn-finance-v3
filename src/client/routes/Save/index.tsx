import { useContext, useEffect } from 'react';
import styled from 'styled-components';

import { useAppSelector, useAppDispatch, useAppTranslation } from '@hooks';
import { VaultsActions, VaultsSelectors } from '@store';
import { formatPercent, humanizeAmount } from '@src/utils';
import { Vault } from '@types';
import { BladeContext, NavSideMenuContext } from '@context';
import { AssetCard, Blade } from '@components/app';
import { List, SpinnerLoading } from '@components/common';
import { device } from '@themes/default';

const SaveView = styled.div`
  display: flex;
  justify-content: center;
`;

const DefaultPageContent = styled.div`
  display: flex;
  max-width: ${({ theme }) => theme.globalMaxWidth};
  width: 100%;
  grid-gap: 2.8rem;
  padding: 0 4rem;
  margin-top: 2.1rem;
  padding-bottom: 4rem;

  @media ${device.tablet} {
    flex-direction: column;
  }
`;

const SaveInfo = styled.div`
  display: flex;
  flex-direction: column;
  width: 40rem;

  h3 {
    margin-top: 1.6rem;
  }
  .t-body-light {
    margin-top: 0.7rem;
  }

  @media ${device.tablet} {
    order: -1;
    width: 100%;
  }
`;

const AssetList = styled.div`
  --vaults-columns: 1fr 1fr 12rem;
  --vaults-padding: 1.1rem;

  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 2rem 0;
  flex: 1;
  min-width: 39rem;
`;

const AssetsHeaders = styled.div`
  display: grid;
  grid-template-columns: var(--vaults-columns);
  padding: var(--vaults-padding);
`;

const ErrorMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: ${({ theme }) => theme.colors.error};
`;

export const Save = () => {
  const { t } = useAppTranslation('common');
  const { close: closeNavSidemenu } = useContext(NavSideMenuContext);
  const { open: openBlade } = useContext(BladeContext);
  const dispatch = useAppDispatch();
  const selectedAddress = useAppSelector(({ wallet }) => wallet.selectedAddress);
  const generalVaultsStatus = useAppSelector(VaultsSelectors.selectSaveVaultsGeneralStatus);
  const vaults = useAppSelector(VaultsSelectors.selectSaveVaults);
  let assetList;

  if (!generalVaultsStatus.loading && !generalVaultsStatus.error) {
    assetList = (
      <AssetList>
        <AssetsHeaders>
          <span>{t('save.assets-headers.asset')}</span>
          <span>{t('save.assets-headers.balance')}</span>
          <span>{t('save.assets-headers.earning')}</span>
        </AssetsHeaders>
        <List
          Component={AssetCard}
          items={vaults.map((vault) => ({
            key: vault.address,
            icon: `https://raw.githack.com/iearn-finance/yearn-assets/master/icons/tokens/${vault.token.address}/logo-128.png`,
            name: vault.name,
            balance: humanizeAmount(vault.vaultBalance, vault.token.decimals, 2),
            earning: formatPercent(vault.apyData, 0),
            onClick: () => selectVault(vault),
          }))}
          width={1}
        />
      </AssetList>
    );
  } else if (generalVaultsStatus.loading) {
    assetList = (
      <AssetList>
        <SpinnerLoading flex="1" />
      </AssetList>
    );
  } else {
    assetList = (
      <AssetList>
        <ErrorMessage>
          {t('errors.default')}
          <br />
          {generalVaultsStatus.error}
        </ErrorMessage>
      </AssetList>
    );
  }

  const saveInfo = (
    <SaveInfo>
      <span className="t-captions">SAVE</span>
      <h3>Deep-dive, deposit</h3>
      <span className="t-body-light">
        something will be written here that hints at what usrs can do with these lists. from ways of customising the
        view, shortcuts, click throughs and how these lists can lead to customised transactions... more to follow.{' '}
      </span>
    </SaveInfo>
  );

  const selectVault = (vault: Vault) => {
    dispatch(VaultsActions.setSelectedVaultAddress({ vaultAddress: vault.address }));
    closeNavSidemenu();
    openBlade();
  };

  useEffect(() => {
    dispatch(VaultsActions.initiateSaveVaults());
  }, []);

  useEffect(() => {
    if (selectedAddress) {
      dispatch(VaultsActions.getUserVaultsData());
    }
  }, [selectedAddress]);

  return (
    <SaveView>
      <Blade></Blade>
      <DefaultPageContent>
        {assetList}
        {saveInfo}
      </DefaultPageContent>
    </SaveView>
  );
};
