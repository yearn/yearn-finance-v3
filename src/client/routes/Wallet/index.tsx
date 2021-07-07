import { useAppSelector, useAppDispatch } from '@hooks';
import { WalletSelectors, TokensSelectors, TokensActions, IronBankActions, ModalsActions } from '@store';
import { Box, SpinnerLoading } from '@components/common';
import { SummaryCard, DetailCard, ViewContainer, ActionButtons, TokenIcon } from '@components/app';
import { humanizeAmount, normalizeUsdc, USDC_DECIMALS } from '@src/utils';

export const Wallet = () => {
  // TODO: Add translation
  // const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const walletIsConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const { totalBalance } = useAppSelector(TokensSelectors.selectSummaryData);
  const userTokens = useAppSelector(TokensSelectors.selectUserTokens);
  const tokensListStatus = useAppSelector(TokensSelectors.selectWalletTokensStatus);

  const actionHandler = (action: string, tokenAddress: string) => {
    switch (action) {
      case 'invest':
        dispatch(TokensActions.setSelectedTokenAddress({ tokenAddress }));
        dispatch(ModalsActions.openModal({ modalName: 'depositTx' }));
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
        items={[{ header: 'Available to Invest', content: `${normalizeUsdc(totalBalance)}` }]}
        variant="secondary"
        cardSize="big"
      />

      {!walletIsConnected && <span>wallet not connect</span>}

      {tokensListStatus.loading && walletIsConnected && (
        <Box height="100%" width="100%" position="relative" display="flex" center>
          <SpinnerLoading flex="1" />
        </Box>
      )}
      {!tokensListStatus.loading && walletIsConnected && (
        <DetailCard
          header="Tokens"
          metadata={[
            {
              key: 'icon',
              transform: ({ icon, symbol }) => <TokenIcon icon={icon} symbol={symbol} />,
              width: '6rem',
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
                    // NOTE: hide for alpha
                    // {
                    //   name: 'Supply',
                    //   handler: () => actionHandler('supply', tokenAddress),
                    //   disabled: !walletIsConnected,
                    // },
                    // {
                    //   name: 'Borrow',
                    //   handler: () => actionHandler('borrow', tokenAddress),
                    //   disabled: !walletIsConnected,
                    // },
                  ]}
                />
              ),
              grow: '1',
            },
          ]}
          data={userTokens.map((token) => ({
            icon: token.icon ?? '',
            symbol: token.symbol,
            name: token.name,
            balance: humanizeAmount(token.balance, token.decimals, 2),
            price: `$ ${humanizeAmount(token.priceUsdc, USDC_DECIMALS, 2)}`,
            value: `$ ${humanizeAmount(token.balanceUsdc, USDC_DECIMALS, 2)}`,
            tokenAddress: token.address,
          }))}
        />
      )}
    </ViewContainer>
  );
};
