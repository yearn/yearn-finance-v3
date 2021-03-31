import { useAppSelector, useAppDispatch } from '@hooks';
import { Box } from '@components/common';
import { getTokens, initiateSaveVaults, selectSaveVaults, setSelectedVaultAddress, selectSelectedVault } from '@store';
import { Vault } from '../../../core/types';
import { useEffect } from 'react';

export const Save = () => {
  // const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const selectedVault = useAppSelector(selectSelectedVault);
  const vaults = useAppSelector(selectSaveVaults);
  const vaultsComponent = vaults.map((vault: Vault) => {
    return (
      <div key={vault.address}>
        vault balance: {vault.vaultBalance}
        user deposited: {vault.userDeposited}
        <button onClick={() => selectVault(vault)}> select</button>
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

  useEffect(() => {
    console.log('cambian las vaults');
    console.log({ vaults });
  }, [vaults]);
  return (
    <Box center flex={1}>
      Save things
      <button onClick={getVaults}>init vaults</button>
      <button onClick={initTokens}>get tokens</button>
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
