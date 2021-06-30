import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { ViewContainer } from '@components/app';
import { Card } from '@components/common';
import { LineChart } from '@components/common/Charts';
import { DepositTx } from '@components/app/Transactions';

// import { useAppTranslation } from '@hooks';

const VaultChart = styled(Card)`
  flex: 1 100%;
  width: 100%;
`;

const VaultActions = styled(Card)`
  display: flex;
  flex-direction: column;
  width: 41.6rem;
`;

const VaultOverview = styled(Card)`
  display: flex;
  flex-direction: column;
  flex: 1;
  align-self: stretch;
`;
const VaultDetailView = styled(ViewContainer)`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

export interface VaultDetailRouteParams {
  vaultId: string;
}

export const VaultDetail = () => {
  // TODO Set selectedVault or token for the DepositTx

  // const { t } = useAppTranslation('common');
  const { vaultId } = useParams<VaultDetailRouteParams>();
  const data = [
    {
      id: 'japan',
      color: '#d9269a',
      data: [
        {
          x: 'plane',
          y: 294,
        },
        {
          x: 'helicopter',
          y: 176,
        },
        {
          x: 'boat',
          y: 170,
        },
        {
          x: 'train',
          y: 182,
        },
        {
          x: 'subway',
          y: 156,
        },
        {
          x: 'bus',
          y: 83,
        },
        {
          x: 'car',
          y: 221,
        },
        {
          x: 'moto',
          y: 37,
        },
        {
          x: 'bicycle',
          y: 60,
        },
        {
          x: 'horse',
          y: 132,
        },
        {
          x: 'skateboard',
          y: 194,
        },
        {
          x: 'others',
          y: 270,
        },
      ],
    },
    {
      id: 'norway',
      color: '#6526d9',
      data: [
        {
          x: 'plane',
          y: 213,
        },
        {
          x: 'helicopter',
          y: 86,
        },
        {
          x: 'boat',
          y: 177,
        },
        {
          x: 'train',
          y: 155,
        },
        {
          x: 'subway',
          y: 197,
        },
        {
          x: 'bus',
          y: 26,
        },
        {
          x: 'car',
          y: 208,
        },
        {
          x: 'moto',
          y: 78,
        },
        {
          x: 'bicycle',
          y: 166,
        },
        {
          x: 'horse',
          y: 217,
        },
        {
          x: 'skateboard',
          y: 150,
        },
        {
          x: 'others',
          y: 222,
        },
      ],
    },
  ];

  return (
    <VaultDetailView>
      <VaultOverview>
        Vault overview data
        <h3>Vault: {vaultId}</h3>
      </VaultOverview>

      <VaultActions>
        Actions tabs
        <DepositTx />
      </VaultActions>

      <VaultChart>
        Performance
        <LineChart chartData={data} />
      </VaultChart>
    </VaultDetailView>
  );
};
