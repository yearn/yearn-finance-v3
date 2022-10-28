import styled from 'styled-components';
import { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';

import { ModalsActions, LinesActions, LinesSelectors } from '@store';
import { useAppDispatch, useAppSelector, useAppTranslation } from '@hooks';
import { device } from '@themes/default';
import { DetailCard, ActionButtons, ViewContainer } from '@components/app';
import { SpinnerLoading, Input, SearchIcon } from '@components/common';
import { ARBITER_POSITION_ROLE, BORROWER_POSITION_ROLE, LENDER_POSITION_ROLE } from '@src/core/types';

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
        name: t('components.transaction.deposit-and-repay'),
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
        <SpinnerLoading flex="1" width="100%" />
      ) : (
        <ViewContainer>
          <PositionsCard
            header={t('components.positions-card.positions')}
            data-testid="vaults-opportunities-list"
            metadata={[
              {
                key: 'displayName',
                header: t('components.positions-card.positions'),
                width: '23rem',
                sortable: true,
                className: 'col-name',
              },
              /** @TODO add tags e.g. spigot here */
              {
                key: 'deposit',
                header: t('components.positions-card.positions'),
                sortable: true,
                width: '15rem',
                className: 'col-assets',
              },
              {
                key: 'status',
                header: t('components.positions-card.status'),
                sortable: true,
                width: '8rem',
                className: 'col-apy',
              },
              {
                key: 'lender',
                header: t('components.positions-card.lender'),
                sortable: true,
                width: '15rem',
                className: 'col-available',
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
              deposit: event['deposit'],
              displayName: event['id'],
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
