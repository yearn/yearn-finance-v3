import { useContext, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@hooks';
import {
  getTokens,
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
import BigNumber from 'bignumber.js';

import { Box } from '@components/common';

export const Save = () => {
  // const { t } = useAppTranslation('common');
  const { toggle } = useContext(BladeContext);
  const dispatch = useAppDispatch();
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

  function getVaults() {
    dispatch(initiateSaveVaults());
  }
  function initTokens() {
    dispatch(getTokens());
  }
  function selectVault(vault: Vault) {
    dispatch(setSelectedVaultAddress({ vaultAddress: vault.address }));
  }
  function approve(vaultAddress: string) {
    dispatch(approveVault({ vaultAddress }));
  }
  function deposit(vaultAddress: string, amount: number) {
    dispatch(depositVault({ vaultAddress, amount: new BigNumber(amount) }));
  }
  function withdraw(vaultAddress: string, amount: number) {
    dispatch(withdrawVault({ vaultAddress, amount: new BigNumber(amount) }));
  }

  useEffect(() => {
    // TODO REMOVE
    console.log({ vaults });
  }, [vaults]);
  return (
    <Box center flex={1}>
      Save things
      <button onClick={getVaults}>init vaults</button>
      <button onClick={initTokens}>get tokens</button>
      <button onClick={toggle}>open Blade</button>
      {vaultsComponent}
      selected vault:
      {selectedVault && (
        <div>
          address: {selectedVault.address}
          deposit limit: {selectedVault.depositLimit}
        </div>
      )}
    </Box>
  );
};
