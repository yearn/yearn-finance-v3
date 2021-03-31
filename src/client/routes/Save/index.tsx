import { useAppSelector, useAppDispatch } from '@hooks';
import { Box } from '@components/common';
import { getTokens, initiateSaveVaults, selectSaveVaults } from '@store';
import { Vault } from '../../../core/types';
import { useEffect } from 'react';

export const Save = () => {
  // const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const vaults = useAppSelector(selectSaveVaults);
  const vaultsComponent = vaults.map((vault: Vault) => {
    return (
      <div key={vault.address}>
        vault balance: {vault.vaultBalance}
        user deposited: {vault.userDeposited}
      </div>
    );
  });

  function getVaults() {
    dispatch(initiateSaveVaults());
  }
  function initTokens() {
    dispatch(getTokens());
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
    </Box>
  );
};
