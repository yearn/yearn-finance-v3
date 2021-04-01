import { useContext, useEffect } from 'react';
import BigNumber from 'bignumber.js';

import { useAppSelector, useAppDispatch } from '@hooks';
import { AssetCard, Blade } from '@components/app';
import { Box, List } from '@components/common';
import {
  initiateSaveVaults,
  selectSaveVaults,
  setSelectedVaultAddress,
  selectSelectedVault,
  depositVault,
  approveVault,
  withdrawVault,
} from '@store';
import { Vault } from '@types';
import { BladeContext } from '@context';
import { weiToUnits, formatAmount } from '@src/utils';

export const Save = () => {
  // const { t } = useAppTranslation('common');
  const { isOpen, toggle } = useContext(BladeContext);
  const dispatch = useAppDispatch();
  const selectedAddress = useAppSelector(({ wallet }) => wallet.selectedAddress);
  const selectedVault = useAppSelector(selectSelectedVault);
  const vaults = useAppSelector(selectSaveVaults);
  const vaultsComponent = vaults.map((vault: Vault) => {
    return (
      <div key={vault.address}>
        vault balance: {vault.vaultBalance}
        user deposited: {vault.userDeposited}
        <button onClick={() => selectVault(vault)}> select</button>
        <button onClick={() => approve(vault.address)}>Approve vault</button>
        <button onClick={() => deposit(vault.address, 30)}>Deposit 30 to vault</button>
        <button onClick={() => withdraw(vault.address, 30)}>Withdraw 30 to vault</button>
      </div>
    );
  });

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

  const getVaults = () => dispatch(initiateSaveVaults());
  const selectVault = (vault: Vault) => dispatch(setSelectedVaultAddress({ vaultAddress: vault.address }));
  const approve = (vaultAddress: string) => dispatch(approveVault({ vaultAddress }));
  const deposit = (vaultAddress: string, amount: number) =>
    dispatch(depositVault({ vaultAddress, amount: new BigNumber(amount) }));
  const withdraw = (vaultAddress: string, amount: number) =>
    dispatch(withdrawVault({ vaultAddress, amount: new BigNumber(amount) }));

  useEffect(() => {
    getVaults();
  }, []);

  useEffect(() => {
    if (selectedAddress) {
      // TODO: FETCH USER DATA
      console.log(`Fetch data for ${selectedAddress}`);
    }
  }, [selectedAddress]);

  return (
    <Box center flex={1}>
      <Blade open={isOpen}></Blade>
      <button onClick={toggle}>open Blade</button>
      {vaultsComponent}
      selected vault:
      {selectedVault && (
        <div>
          address: {selectedVault.address}
          deposit limit: {selectedVault.depositLimit}
        </div>
      )}
      {vaultList}
    </Box>
  );
};
