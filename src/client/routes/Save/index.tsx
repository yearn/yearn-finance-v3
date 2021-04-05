import { useContext, useEffect } from 'react';
import styled from 'styled-components';

import { useAppSelector, useAppDispatch } from '@hooks';
import { AssetCard, Blade } from '@components/app';
import { Box, List } from '@components/common';
import { initiateSaveVaults, selectSaveVaults, setSelectedVaultAddress, getUserVaultsData } from '@store';
import { Vault } from '@types';
import { BladeContext, NavSideMenuContext } from '@context';
import { weiToUnits, formatAmount } from '@src/utils';

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

const VaultsList = styled.div`
  --vaults-columns: 1fr 12rem;
  --vaults-padding: 1.1rem;

  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 2rem 0;
  flex: 1;
`;

const VaultsHeader = styled.div`
  display: grid;
  grid-template-columns: var(--vaults-columns);
  padding: var(--vaults-padding);
`;

export const Save = () => {
  // const { t } = useAppTranslation('common');
  const { close: closeNavSidemenu } = useContext(NavSideMenuContext);
  const { open: openBlade } = useContext(BladeContext);
  const dispatch = useAppDispatch();
  const selectedAddress = useAppSelector(({ wallet }) => wallet.selectedAddress);
  const vaults = useAppSelector(selectSaveVaults);

  const vaultList = (
    <VaultsList>
      <VaultsHeader>
        <span>Col</span>
        <span>Col2</span>
      </VaultsHeader>
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
    </VaultsList>
  );
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
        {vaultList}
        {saveInfo}
      </SaveContent>
    </SaveView>
  );
};
