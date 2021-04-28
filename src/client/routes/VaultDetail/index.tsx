import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { LineChart } from '@components/common/Charts';

// import { useAppTranslation } from '@hooks';

const VaultDetailView = styled.div`
  display: flex;
  justify-content: center;
`;

const DefaultPageContent = styled.div`
  display: flex;
  flex-direction: column;
  max-width: ${({ theme }) => theme.globalMaxWidth};
  width: 100%;
  grid-gap: 2.8rem;
  padding: 0 4rem;
  margin-top: 2.1rem;
  padding-bottom: 4rem;
`;

export interface VaultDetailRouteParams {
  vaultId: string;
}

export const VaultDetail = () => {
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
  ];

  return (
    <VaultDetailView>
      <DefaultPageContent>
        <span>Vault: {vaultId}</span>

        <h4>Earnings over time</h4>
        <LineChart data={data} />
      </DefaultPageContent>
    </VaultDetailView>
  );
};
