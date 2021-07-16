import styled, { css } from 'styled-components';

import { useAppSelector, useAppDispatch } from '@hooks';
import { WalletSelectors, TokensSelectors, TokensActions, IronBankActions, ModalsActions } from '@store';

import { SummaryCard, DetailCard, ViewContainer, ActionButtons, TokenIcon, NoWalletCard } from '@components/app';
import { SpinnerLoading } from '@components/common';
import { halfWidthCss, humanizeAmount, normalizeUsdc, USDC_DECIMALS } from '@src/utils';
import { device } from '@themes/default';

const TokensCard = styled(DetailCard)`
  @media (max-width: 800px) {
    .col-price {
      display: none;
    }
  }
  @media (max-width: 700px) {
    .col-name {
      width: 7rem;
    }
  }
  @media ${device.mobile} {
    .col-balance {
      display: none;
    }
  }
`;

const StyledNoWalletCard = styled(NoWalletCard)`
  ${halfWidthCss}
  width: 100%;
`;

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
        header="Dashboard"
        items={[{ header: 'Available to Invest', content: `${normalizeUsdc(totalBalance)}` }]}
        variant="secondary"
        cardSize="small"
      />

      {!walletIsConnected && <StyledNoWalletCard />}

      {tokensListStatus.loading && walletIsConnected && <SpinnerLoading flex="1" width="100%" />}
      {!tokensListStatus.loading && walletIsConnected && (
        <TokensCard
          header="Tokens"
          wrap
          metadata={[
            {
              key: 'icon',
              transform: ({ icon, symbol }) => <TokenIcon icon={icon} symbol={symbol} />,
              width: '6rem',
              className: 'col-icon',
            },
            { key: 'name', header: 'Name', width: '17rem', className: 'col-name' },
            { key: 'balance', header: 'Balance', width: '13rem', className: 'col-balance' },
            { key: 'price', header: 'Price', width: '10rem', className: 'col-price' },
            { key: 'value', header: 'Value', width: '11rem', className: 'col-value' },
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
              align: 'flex-end',
              width: 'auto',
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
