import { useContext, useEffect } from 'react';
import styled from 'styled-components';

import { useAppSelector, useAppDispatch, useAppTranslation } from '@hooks';
import { AssetCard, Blade } from '@components/app';
import { List } from '@components/common';
import {
  initiateSaveVaults,
  selectSaveVaults,
  setSelectedVaultAddress,
  getUserVaultsData,
  selectSaveVaultsGeneralStatus,
} from '@store';
import { Vault } from '@types';
import { BladeContext, NavSideMenuContext } from '@context';
import { weiToUnits, formatAmount } from '@src/utils';
import { SpinnerLoading } from '../../components/common/SpinnerLoading';

const SaveView = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SaveContent = styled.div`
  display: flex;
  max-width: ${({ theme }) => theme.globalMaxWidth};
  width: 100%;
  grid-gap: 2.8rem;
  padding: 0 4rem;
  margin-top: 2.1rem;
`;

const SaveInfo = styled.div`
  display: flex;
  flex-direction: column;
  width: 40rem;
`;

const AssetList = styled.div`
  --vaults-columns: 1fr 12rem;
  --vaults-padding: 1.1rem;

  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 2rem 0;
  flex: 1;
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
  const generalVaultsStatus = useAppSelector(selectSaveVaultsGeneralStatus);
  const vaults = useAppSelector(selectSaveVaults);
  let assetList;

  if (!generalVaultsStatus.loading && !generalVaultsStatus.error) {
    assetList = (
      <AssetList>
        <AssetsHeaders>
          <span>{t('commons.save.vaults-headers.asset')}</span>
          <span>{t('commons.save.vaults-headers.balance')}</span>
        </AssetsHeaders>
        <List
          Component={AssetCard}
          items={vaults.map((vault) => ({
            key: vault.address,
            icon: `https://raw.githack.com/iearn-finance/yearn-assets/master/icons/tokens/0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE/logo-128.png`,
            name: vault.name,
            balance: formatAmount(weiToUnits(vault.vaultBalance, 18), 2),
            earning: '',
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
      <h3>SAVE</h3>
      <h1>Deep-dive, deposit</h1>
      <span>
        something will be written here that hints at what usrs can do with these lists. from ways of customising the
        view, shortcuts, click throughs and how these lists can lead to customised transactions... more to follow.{' '}
      </span>
    </SaveInfo>
  );

  const selectVault = (vault: Vault) => {
    dispatch(setSelectedVaultAddress({ vaultAddress: vault.address }));
    closeNavSidemenu();
    openBlade();
  };

  useEffect(() => {
    dispatch(initiateSaveVaults());
  }, []);

  useEffect(() => {
    if (selectedAddress) {
      dispatch(getUserVaultsData());
    }
  }, [selectedAddress]);

  return (
    <SaveView>
      <Blade></Blade>
      <SaveContent>
        {assetList}
        {saveInfo}
      </SaveContent>
    </SaveView>
  );
};
