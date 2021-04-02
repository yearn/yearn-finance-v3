import { useContext, useEffect } from 'react';

import { useAppSelector, useAppDispatch } from '@hooks';
import { AssetCard, Blade } from '@components/app';
import { Box, List } from '@components/common';
import { initiateSaveVaults, selectSaveVaults, setSelectedVaultAddress, getUserVaultsData } from '@store';
import { Vault } from '@types';
import { BladeContext } from '@context';
import { weiToUnits, formatAmount } from '@src/utils';

export const Save = () => {
  // const { t } = useAppTranslation('common');
  const { isOpen, open: openBlade } = useContext(BladeContext);
  const dispatch = useAppDispatch();
  const selectedAddress = useAppSelector(({ wallet }) => wallet.selectedAddress);
  const vaults = useAppSelector(selectSaveVaults);

  const vaultList = (
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
      px={80}
    />
  );

  const selectVault = (vault: Vault) => {
    dispatch(setSelectedVaultAddress({ vaultAddress: vault.address }));
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
    <Box center flex={1}>
      <Blade open={isOpen}></Blade>
      {vaultList}
    </Box>
  );
};
