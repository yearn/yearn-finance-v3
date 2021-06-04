import { useEffect } from 'react';

import { useAppSelector, useAppDispatch } from '@hooks';
import { VaultsActions, WalletSelectors, TokensSelectors, TokensActions, IronBankActions, ModalsActions } from '@store';
import { SpinnerLoading } from '@components/common';
import { SummaryCard, DetailCard, ViewContainer, ActionButtons, TokenIcon } from '@components/app';
import { humanizeAmount, USDC_DECIMALS } from '@src/utils';

export const Wallet = () => {
  // TODO: Add translation
  // const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const selectedAddress = useAppSelector(WalletSelectors.selectSelectedAddress);
  const walletIsConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const { totalBalance, tokensAmount } = useAppSelector(TokensSelectors.selectSummaryData);
  const userTokens = useAppSelector(TokensSelectors.selectUserTokens);
  const tokensListStatus = useAppSelector(TokensSelectors.selectWalletTokensStatus);

  useEffect(() => {
    dispatch(VaultsActions.initiateSaveVaults());
  }, []);

  useEffect(() => {
    if (selectedAddress) {
      dispatch(VaultsActions.getUserVaultsPositions({}));
      dispatch(TokensActions.getUserTokens({}));
    }
  }, [selectedAddress]);

  const actionHandler = (action: string, tokenAddress: string) => {
    switch (action) {
      case 'invest':
        dispatch(TokensActions.setSelectedTokenAddress({ tokenAddress }));
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

  if (tokensListStatus.loading) {
    return (
      <ViewContainer>
        <SpinnerLoading flex="1" />
      </ViewContainer>
    );
  }

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
            transform: ({ tokenAddress }) => (
              <ActionButtons
                actions={[
                  {
                    name: 'Invest',
                    handler: () => actionHandler('invest', tokenAddress),
                    disabled: !walletIsConnected,
                  },
                  {
                    name: 'Supply',
                    handler: () => actionHandler('supply', tokenAddress),
                    disabled: !walletIsConnected,
                  },
                  {
                    name: 'Borrow',
                    handler: () => actionHandler('borrow', tokenAddress),
                    disabled: !walletIsConnected,
                  },
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
          tokenAddress: token.address,
        }))}
      />
    </ViewContainer>
  );
};
