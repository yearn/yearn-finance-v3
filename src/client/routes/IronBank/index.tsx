import { useState, useEffect } from 'react';
import styled from 'styled-components';

import { useAppSelector, useAppDispatch, useIsMounting, useAppTranslation } from '@hooks';
import {
  ModalsActions,
  IronBankActions,
  IronBankSelectors,
  TokensSelectors,
  ModalSelectors,
  AppSelectors,
} from '@store';
import { ToggleButton, Text } from '@components/common';
import { SummaryCard, DetailCard, ViewContainer, ActionButtons, TokenIcon, InfoCard, Amount } from '@components/app';
import { humanize, halfWidthCss, normalizeAmount } from '@utils';

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  grid-gap: ${({ theme }) => theme.layoutPadding};
  flex-wrap: wrap;
  width: 100%;
`;

const StyledInfoCard = styled(InfoCard)`
  max-width: 100%;
  flex: 1;
  ${halfWidthCss}
`;

const SupplyingCard = styled(DetailCard)`
  @media (max-width: 860px) {
    .col-name {
      width: 9rem;
    }
  }
  @media (max-width: 760px) {
    .col-balance {
      display: none;
    }
  }
  @media (max-width: 630px) {
    .col-apy {
      display: none;
    }
  }
  @media (max-width: 600px) {
    .col-apy {
      display: flex;
    }
  }
  @media (max-width: 450px) {
    .col-apy {
      display: none;
    }
  }
  @media (max-width: 360px) {
    .col-value {
      display: none;
    }
  }
` as typeof DetailCard;

const BorrowingCard = styled(DetailCard)`
  @media (max-width: 800px) {
    .col-name {
      width: 9rem;
    }
  }
  @media (max-width: 700px) {
    .col-balance {
      display: none;
    }
  }
  @media (max-width: 360px) {
    .col-apy {
      display: none;
    }
  }
` as typeof DetailCard;

export const IronBank = () => {
  const { t } = useAppTranslation(['common', 'ironbank']);

  const dispatch = useAppDispatch();
  const isMounting = useIsMounting();
  const { supplyBalanceUsdc, borrowBalanceUsdc, borrowUtilizationRatio, borrowLimitUsdc } = useAppSelector(
    IronBankSelectors.selectSummaryData
  );
  const markets = useAppSelector(IronBankSelectors.selectMarkets);
  const supplied = useAppSelector(IronBankSelectors.selectLendMarkets);
  const borrowed = useAppSelector(IronBankSelectors.selectBorrowMarkets);
  const [filteredMarkets, setFilteredMarkets] = useState(markets);
  const activeModal = useAppSelector(ModalSelectors.selectActiveModal);

  const appStatus = useAppSelector(AppSelectors.selectAppStatus);
  const ironBankStatus = useAppSelector(IronBankSelectors.selectIronBankStatus);
  const tokensStatus = useAppSelector(TokensSelectors.selectWalletTokensStatus);
  const generalLoading =
    (appStatus.loading || ironBankStatus.loading || tokensStatus.loading || isMounting) && !activeModal;
  const marketsLoading = generalLoading && !filteredMarkets.length;

  const userHasPosition = !!supplied.length || !!borrowed.length;

  useEffect(() => {
    setFilteredMarkets(markets);
  }, [markets]);

  const actionHandler = (action: string, marketAddress: string) => {
    switch (action) {
      case 'enterMarket':
        dispatch(IronBankActions.enterOrExitMarket({ marketAddress: marketAddress, actionType: 'enterMarket' }));
        break;
      case 'exitMarket':
        dispatch(IronBankActions.enterOrExitMarket({ marketAddress: marketAddress, actionType: 'exitMarket' }));
        break;
      case 'supply':
        dispatch(IronBankActions.setSelectedMarketAddress({ marketAddress }));
        dispatch(ModalsActions.openModal({ modalName: 'IronBankSupplyTx' }));
        break;
      case 'withdraw':
        dispatch(IronBankActions.setSelectedMarketAddress({ marketAddress }));
        dispatch(ModalsActions.openModal({ modalName: 'IronBankWithdrawTx' }));
        break;
      case 'borrow':
        dispatch(IronBankActions.setSelectedMarketAddress({ marketAddress }));
        dispatch(ModalsActions.openModal({ modalName: 'IronBankBorrowTx' }));
        break;
      case 'repay':
        dispatch(IronBankActions.setSelectedMarketAddress({ marketAddress }));
        dispatch(ModalsActions.openModal({ modalName: 'IronBankRepayTx' }));
        break;
    }
  };

  return (
    <ViewContainer>
      <Row>
        <StyledInfoCard
          header={t('ironbank:ironbank-announcement-card.header')}
          Component={
            <Text>
              <p>{t('ironbank:ironbank-announcement-card.desc-1')}</p>
              <p>{t('ironbank:ironbank-announcement-card.desc-2')}</p>
            </Text>
          }
        />
      </Row>

      {userHasPosition && !marketsLoading && (
        <>
          <SummaryCard
            header={t('dashboard.header')}
            items={[
              { header: t('dashboard.supplied'), Component: <Amount value={supplyBalanceUsdc} input="usdc" /> },
              { header: t('dashboard.borrowed'), Component: <Amount value={borrowBalanceUsdc} input="usdc" /> },
              {
                header: t('dashboard.borrow-limit-used'),
                Component: <Amount value={borrowUtilizationRatio} input="weipercent" />,
              },
              { header: t('dashboard.borrow-limit-total'), Component: <Amount value={borrowLimitUsdc} input="usdc" /> },
            ]}
            variant="secondary"
            cardSize="small"
          />

          <SupplyingCard
            header={t('components.list-card.supplying')}
            metadata={[
              {
                key: 'displayIcon',
                transform: ({ displayIcon, token }) => <TokenIcon icon={displayIcon} symbol={token.symbol} />,
                width: '6rem',
                className: 'col-icon',
              },
              {
                key: 'displayName',
                header: t('components.list-card.name'),
                sortable: true,
                fontWeight: 600,
                width: '17rem',
                className: 'col-name',
              },
              {
                key: 'lendApy',
                header: t('components.list-card.apy'),
                format: ({ lendApy }) => humanize('percent', lendApy),
                sortable: true,
                width: '8rem',
                className: 'col-apy',
              },
              {
                key: 'balance',
                header: t('components.list-card.balance'),
                format: ({ userDeposited, token }) => humanize('amount', userDeposited, token.decimals, 4),
                sortable: true,
                width: '13rem',
                className: 'col-balance',
              },
              {
                key: 'userDepositedUsdc',
                header: t('components.list-card.value'),
                format: ({ userDepositedUsdc }) => humanize('usd', userDepositedUsdc),
                sortable: true,
                width: '11rem',
                className: 'col-value',
              },
              {
                key: 'collateral',
                header: t('components.list-card.collateral'),
                transform: ({ collateral, address }) => (
                  <ToggleButton
                    selected={collateral}
                    setSelected={() =>
                      collateral ? actionHandler('exitMarket', address) : actionHandler('enterMarket', address)
                    }
                  />
                ),
                width: '8rem',
                className: 'col-collateral',
              },
              {
                key: 'actions',
                transform: ({ address }) => (
                  <ActionButtons
                    actions={[
                      { name: t('components.transaction.supply'), handler: () => actionHandler('supply', address) },
                      { name: t('components.transaction.withdraw'), handler: () => actionHandler('withdraw', address) },
                    ]}
                  />
                ),
                align: 'flex-end',
                width: 'auto',
                grow: '1',
              },
            ]}
            data={supplied.map((market) => ({
              ...market,
              displayIcon: market.token.icon ?? '',
              displayName: market.token.symbol,
              balance: normalizeAmount(market.userDeposited, market.token.decimals),
              collateral: market.enteredMarket,
              actions: null,
            }))}
            initialSortBy="userDepositedUsdc"
            wrap
          />

          <BorrowingCard
            header={t('components.list-card.borrowing')}
            metadata={[
              {
                key: 'displayIcon',
                transform: ({ displayIcon, token }) => <TokenIcon icon={displayIcon} symbol={token.symbol} />,
                width: '6rem',
                className: 'col-icon',
              },
              {
                key: 'displayName',
                header: t('components.list-card.name'),
                sortable: true,
                fontWeight: 600,
                width: '17rem',
                className: 'col-name',
              },
              {
                key: 'borrowApy',
                header: t('components.list-card.apy'),
                format: ({ borrowApy }) => humanize('percent', borrowApy),
                sortable: true,
                width: '8rem',
                className: 'col-apy',
              },
              {
                key: 'balance',
                header: t('components.list-card.balance'),
                format: ({ userDeposited, token }) => humanize('amount', userDeposited, token.decimals, 4),
                sortable: true,
                width: '13rem',
                className: 'col-balance',
              },
              {
                key: 'userDepositedUsdc',
                header: t('components.list-card.value'),
                format: ({ userDepositedUsdc }) => humanize('usd', userDepositedUsdc),
                sortable: true,
                width: '11rem',
                className: 'col-value',
              },
              {
                key: 'actions',
                transform: ({ address }) => (
                  <ActionButtons
                    actions={[
                      { name: t('components.transaction.borrow'), handler: () => actionHandler('borrow', address) },
                      { name: t('components.transaction.repay'), handler: () => actionHandler('repay', address) },
                    ]}
                  />
                ),
                align: 'flex-end',
                width: 'auto',
                grow: '1',
              },
            ]}
            data={borrowed.map((market) => ({
              ...market,
              displayIcon: market.token.icon ?? '',
              displayName: market.token.symbol,
              balance: normalizeAmount(market.userDeposited, market.token.decimals),
              actions: null,
            }))}
            initialSortBy="userDepositedUsdc"
            wrap
          />
        </>
      )}
    </ViewContainer>
  );
};
