import styled from 'styled-components';
import { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';

import { ModalsActions, LinesActions, LinesSelectors } from '@store';
import { useAppDispatch, useAppSelector, useAppTranslation } from '@hooks';
import { device } from '@themes/default';
import { DetailCard, ActionButtons, ViewContainer, SliderCard } from '@components/app';
import { Input, SearchIcon, Text, Button } from '@components/common';
import { ARBITER_POSITION_ROLE, BORROWER_POSITION_ROLE, LENDER_POSITION_ROLE } from '@src/core/types';
import { humanize } from '@src/utils';

const PositionsCard = styled(DetailCard)`
  max-width: ${({ theme }) => theme.globalMaxWidth};
  padding: ${({ theme }) => theme.card.padding};
  @media ${device.tablet} {
    .col-name {
      width: 100%;
    }
  }
  @media (max-width: 750px) {
    .col-assets {
      display: none;
    }
  }
  @media ${device.mobile} {
    .col-available {
      width: 10rem;
    }
  }
  @media (max-width: 450px) {
    .col-available {
      display: none;
    }
  }
` as typeof DetailCard;

const TableHeader = styled.h3`
  ${({ theme }) => `
    font-size: ${theme.fonts.sizes.xl};
    font-weight: 600;
    margin: ${theme.spacing.xl} 0;
    color: ${theme.colors.primary};
  `}
`;

interface CreditEventsTableProps {
  events: [];
}

const BannerCtaButton = styled(Button)`
  width: 80%;
  max-width: 20rem;
  margin-top: 1em;
`;

export const CreditEventsTable = (props: CreditEventsTableProps) => {
  const { t } = useAppTranslation(['common', 'lineDetails']);
  const selectedLine = useAppSelector(LinesSelectors.selectSelectedLine);
  const userRoleMetadata = useAppSelector(LinesSelectors.selectUserPositionMetadata);
  const [actions, setActions] = useState([]);
  const { events } = props;
  const dispatch = useAppDispatch();

  useEffect(() => {
    let Transactions = [];

    // TODO integrate UserPositoinMetadata in here
    if (userRoleMetadata.role === BORROWER_POSITION_ROLE) {
      Transactions.push({
        name: t('components.transaction.borrow'),
        handler: () => borrowHandler(),
        disabled: false,
      });
      Transactions.push({
        name: t('components.transaction.deposit-and-repay.header'),
        handler: () => depositAndRepayHandler(),
        disabled: false,
      });
    }
    if (userRoleMetadata.role === LENDER_POSITION_ROLE) {
      Transactions.push({
        name: t('components.transaction.deposit'),
        handler: () => depositHandler(),
        disabled: false,
      });
      Transactions.push({
        name: t('components.transaction.withdraw'),
        handler: () => WithdrawHandler(),
        disabled: false,
      });
    }
    //@ts-ignore
    if (userRoleMetadata.role === ARBITER_POSITION_ROLE) {
      Transactions.push({
        name: t('components.transaction.liquidate'),
        handler: () => liquidateHandler(),
        disabled: false,
      });
    }
    if (userRoleMetadata.role === LENDER_POSITION_ROLE || userRoleMetadata.role === BORROWER_POSITION_ROLE) {
      Transactions.push({
        name: t('Accept'),
        handler: () => console.log('Accept deal'),
        disabled: true,
      });
    }
    //@ts-ignore
    setActions(Transactions);
  }, [selectedLine]);

  const depositHandler = () => {
    if (!selectedLine) {
      return;
    }
    let address = selectedLine.id;
    dispatch(LinesActions.setSelectedLineAddress({ lineAddress: address }));
    dispatch(ModalsActions.openModal({ modalName: 'addPosition' }));
  };

  // THIS NEEDS REVISITNG
  const liquidateHandler = () => {
    if (!selectedLine) {
      return;
    }
    let address = selectedLine.id;
    dispatch(LinesActions.setSelectedLineAddress({ lineAddress: address }));
    dispatch(ModalsActions.openModal({ modalName: 'liquidateBorrower' }));
  };

  const WithdrawHandler = () => {
    if (!selectedLine) {
      return;
    }
    let address = selectedLine.id;
    dispatch(LinesActions.setSelectedLineAddress({ lineAddress: address }));
    dispatch(ModalsActions.openModal({ modalName: 'withdraw' }));
  };

  const borrowHandler = () => {
    if (!selectedLine) {
      return;
    }
    let address = selectedLine.id;
    dispatch(LinesActions.setSelectedLineAddress({ lineAddress: address }));
    dispatch(ModalsActions.openModal({ modalName: 'borrow' }));
  };

  const depositAndRepayHandler = () => {
    dispatch(ModalsActions.openModal({ modalName: 'depositAndRepay' }));
  };

  return (
    <>
      <TableHeader>{t('components.positions-card.positions')}</TableHeader>
      {isEmpty(events) ? (
        <SliderCard
          header={t('lineDetails:positions-events.header')}
          Component={
            <Text>
              <p>{t('lineDetails:positions-events.no-data')}</p>

              <BannerCtaButton styling="primary" onClick={depositHandler}>
                {t('lineDetails:positions-events.propose-position')}
              </BannerCtaButton>
            </Text>
          }
        />
      ) : (
        <ViewContainer>
          <PositionsCard
            header={t('components.positions-card.positions')}
            data-testid="vaults-opportunities-list"
            metadata={[
              /** @TODO add tags e.g. spigot here */
              {
                key: 'deposit',
                header: t('components.positions-card.total-deposits'),
                sortable: true,
                width: '15rem',
                className: 'col-assets',
              },
              {
                key: 'lender',
                header: t('components.positions-card.lender'),
                sortable: true,
                width: '15rem',
                className: 'col-available',
              },
              {
                key: 'drate',
                header: t('components.positions-card.drate'),
                sortable: true,
                width: '7rem',
                className: 'col-assets',
              },
              {
                key: 'frate',
                header: t('components.positions-card.frate'),
                sortable: true,
                width: '7rem',
                className: 'col-assets',
              },
              {
                key: 'status',
                header: t('components.positions-card.status'),
                sortable: true,
                width: '10rem',
                className: 'col-apy',
              },
              {
                key: 'actions',
                transform: () => <ActionButtons actions={actions} />,
                align: 'flex-end',
                width: 'auto',
                grow: '1',
              },
            ]}
            data={events.map((event) => ({
              // this needs to be humanized to correct amount depending on the token.
              deposit: humanize('amount', event['deposit'], 18, 2),
              drate: `${event['drate']} %`,
              frate: `${event['frate']} %`,
              status: event['status'],
              lender: event['lender'],
              actions: null,
            }))}
            SearchBar={
              <Input
                value={''}
                onChange={(e) => console.log('hi')}
                placeholder={t('components.search-input.search')}
                Icon={SearchIcon}
              />
            }
            searching={false}
            filterLabel="Show 0% APY"
            //@ts-ignore
            filterBy={''}
            //@ts-ignore
            onAction={console.log('o')}
            wrap
          />
        </ViewContainer>
      )}
    </>
  );
};
