import { useEffect } from 'react';
// import styled from 'styled-components';

import { useAppSelector, useAppDispatch } from '@hooks';
import { Box, Button } from '@components/common';

import { VaultsActions, WalletSelectors, TokensSelectors, TokensActions, IronBankActions, ModalsActions } from '@store';
import { SummaryCard, DetailCard, ViewContainer, ActionButtons, TokenIcon } from '@components/app';
import { humanizeAmount, USDC_DECIMALS } from '@src/utils';

interface TokenProps {
  address: string;
  symbol: string;
}

const Token = ({ address, symbol }: TokenProps) => {
  return (
    <Box display="flex" flexDirection="row" alignItems="center">
      <img alt={symbol} src={`https://zapper.fi/images/${symbol}-icon.png`} width="36" height="36" />
    </Box>
  );
};

interface ActionProps {
  type: 'tokens';
}

const Actions = ({ type }: ActionProps) => {
  switch (type) {
    case 'tokens':
      return (
        <Box display="flex" flexDirection="row" alignItems="center">
          <Button>Invest</Button>
          <Button>Lend</Button>
          <Button>Borrow</Button>
        </Box>
      );
  }
};

export const Wallet = () => {
  // TODO: Add translation
  // const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const selectedAddress = useAppSelector(WalletSelectors.selectSelectedAddress);
  const walletIsConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const { totalBalance, tokensAmount } = useAppSelector(TokensSelectors.selectSummaryData);
  const userTokens = useAppSelector(TokensSelectors.selectUserTokens);

  useEffect(() => {
    dispatch(VaultsActions.initiateSaveVaults());
  }, []);

  useEffect(() => {
    if (selectedAddress) {
      dispatch(VaultsActions.getUserVaultsPositions({}));
      dispatch(TokensActions.getUserTokens({}));
    }
  }, [selectedAddress]);

  const actionHandler = (action: string) => {
    switch (action) {
      case 'invest':
        // TODO: DEFINE DEFAULT SELECTED VAULT ADDRESS CRITERIA
        dispatch(VaultsActions.setSelectedVaultAddress({ vaultAddress: '0xE14d13d8B3b85aF791b2AADD661cDBd5E6097Db1' }));
        dispatch(ModalsActions.openModal({ modalName: 'deposit' }));
        break;
      case 'supply':
      case 'borrow':
        // TODO: SET CORRESPONDING MARKET
        dispatch(
          IronBankActions.setSelectedMarketAddress({ marketAddress: '0x41c84c0e2EE0b740Cf0d31F63f3B6F627DC6b393' })
        );
        dispatch(ModalsActions.openModal({ modalName: 'test' }));
        break;
      default:
        break;
    }
  };

  return (
    <ViewContainer>
      <SummaryCard
        items={[
          { header: 'Balance', content: `$ ${humanizeAmount(totalBalance, USDC_DECIMALS, 2)}` },
          { header: 'Tokens Owned', content: tokensAmount },
        ]}
        variant="secondary"
      />

      <DetailCard
        header="Tokens"
        metadata={[
          {
            key: 'icon',
            transform: ({ icon, symbol }) => <TokenIcon icon={icon} symbol={symbol} />,
            width: '4.8rem',
          },
          { key: 'name', header: 'Name' },
          { key: 'balance', header: 'Balance' },
          { key: 'price', header: 'Price' },
          { key: 'value', header: 'Value' },
          {
            key: 'actions',
            transform: () => (
              <ActionButtons
                actions={[
                  { name: 'Invest', handler: () => actionHandler('invest'), disabled: !walletIsConnected },
                  { name: 'Supply', handler: () => actionHandler('supply'), disabled: !walletIsConnected },
                  { name: 'Borrow', handler: () => actionHandler('borrow'), disabled: !walletIsConnected },
                ]}
              />
            ),
            align: 'flex-end',
            grow: '1',
          },
        ]}
        data={userTokens.map((token) => ({
          icon: token.icon ?? '',
          symbol: token.symbol,
          name: token.name,
          balance: humanizeAmount(token.balance, token.decimals, 2),
          price: `$ ${humanizeAmount(token.priceUsdc, USDC_DECIMALS, 4)}`,
          value: `$ ${humanizeAmount(token.balanceUsdc, USDC_DECIMALS, 2)}`,
        }))}
      />
    </ViewContainer>
  );
};
