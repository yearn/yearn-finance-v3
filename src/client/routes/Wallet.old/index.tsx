import styled from 'styled-components';

import { useAppSelector, useAppDispatch, useIsMounting, useAppTranslation } from '@hooks';
import {
  WalletSelectors,
  TokensSelectors,
  TokensActions,
  ModalsActions,
  ModalSelectors,
  VaultsSelectors,
  AppSelectors,
} from '@store';
import {
  SummaryCard,
  DetailCard,
  ViewContainer,
  ActionButtons,
  TokenIcon,
  NoWalletCard,
  Amount,
} from '@components/app';
import { SpinnerLoading } from '@components/common';
import { getConstants } from '@config/constants';
import { halfWidthCss, humanize, normalizeAmount } from '@utils';
import { device } from '@themes/default';

const TokensCard = styled(DetailCard)`
  @media (max-width: 800px) {
    .col-price {
      display: none;
    }
  }
  @media (max-width: 700px) {
    .col-name {
      width: 12rem;
    }
  }
  @media ${device.mobile} {
    .col-name {
      width: 11rem;
    }
    .col-balance {
      display: none;
    }
  }
` as typeof DetailCard;

const StyledNoWalletCard = styled(NoWalletCard)`
  ${halfWidthCss}
  width: 100%;
`;

export const Wallet = () => {
  const { t } = useAppTranslation(['common', 'wallet']);
  const dispatch = useAppDispatch();
  const isMounting = useIsMounting();
  const walletIsConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const { totalBalance } = useAppSelector(TokensSelectors.selectSummaryData);
  const userTokens = useAppSelector(TokensSelectors.selectUserTokens);
  const activeModal = useAppSelector(ModalSelectors.selectActiveModal);
  const vaultsUnderlyingTokens = useAppSelector(VaultsSelectors.selectUnderlyingTokensAddresses);

  const appStatus = useAppSelector(AppSelectors.selectAppStatus);
  const tokensListStatus = useAppSelector(TokensSelectors.selectWalletTokensStatus);
  const generalLoading = (appStatus.loading || tokensListStatus.loading || isMounting) && !activeModal;
  const userTokensLoading = generalLoading && !userTokens.length;
  const { DUST_AMOUNT_USD } = getConstants();

  const actionHandler = (action: string, tokenAddress: string) => {
    switch (action) {
      case 'invest':
        dispatch(TokensActions.setSelectedTokenAddress({ tokenAddress }));
        dispatch(ModalsActions.openModal({ modalName: 'depositTx' }));
        break;
      default:
        break;
    }
  };

  const investButton = (tokenAddress: string, isZapable: boolean) => {
    return [
      {
        name: t('components.transaction.deposit'),
        handler: () => actionHandler('invest', tokenAddress),
        disabled: !walletIsConnected || !(isZapable || vaultsUnderlyingTokens.includes(tokenAddress)),
      },
    ];
  };

  const filterDustTokens = (item: { balanceUsdc: string }) => {
    return parseInt(item.balanceUsdc) > parseInt(DUST_AMOUNT_USD);
  };

  return (
    <ViewContainer>
      <SummaryCard
        items={[{ header: t('dashboard.available'), Component: <Amount value={totalBalance} input="usdc" /> }]}
        cardSize="small"
      />

      {!generalLoading && !walletIsConnected && <StyledNoWalletCard />}

      {userTokensLoading && <SpinnerLoading flex="1" width="100%" />}
      {!userTokensLoading && (
        <TokensCard
          header={t('components.list-card.tokens')}
          metadata={[
            {
              key: 'displayIcon',
              transform: ({ displayIcon, symbol }) => <TokenIcon icon={displayIcon} symbol={symbol} />,
              width: '6rem',
              className: 'col-icon',
            },
            {
              key: 'displayName',
              header: t('components.list-card.name'),
              sortable: true,
              width: '17rem',
              className: 'col-name',
            },
            {
              key: 'tokenBalance',
              header: t('components.list-card.balance'),
              format: ({ balance, decimals }) => humanize('amount', balance, decimals, 2),
              sortable: true,
              width: '13rem',
              className: 'col-balance',
            },
            {
              key: 'priceUsdc',
              header: t('components.list-card.price'),
              format: ({ priceUsdc }) => humanize('usd', priceUsdc),
              sortable: true,
              width: '11rem',
              className: 'col-price',
            },
            {
              key: 'balanceUsdc',
              header: t('components.list-card.value'),
              format: ({ balanceUsdc }) => humanize('usd', balanceUsdc),
              sortable: true,
              width: '11rem',
              className: 'col-value',
            },
            {
              key: 'invest',
              transform: ({ address, isZapable }) => <ActionButtons actions={[...investButton(address, isZapable)]} />,
              align: 'flex-end',
              width: 'auto',
              grow: '1',
            },
          ]}
          data={userTokens.map((token) => ({
            ...token,
            displayName: token.symbol,
            displayIcon: token.icon ?? '',
            tokenBalance: normalizeAmount(token.balance, token.decimals),
            invest: null,
          }))}
          initialSortBy="balanceUsdc"
          wrap
          filterBy={filterDustTokens}
          filterLabel="Show Dust"
        />
      )}
    </ViewContainer>
  );
};
