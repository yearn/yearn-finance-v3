import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { TokensSelectors, VaultsSelectors } from '@store';
import { useAppSelector } from '@hooks';
import { VaultDetailPanels, ViewContainer } from '@components/app';
import { SpinnerLoading, Button } from '@components/common';

const BackButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.onSurfaceH2};
`;

const ViewHeader = styled.div`
  flex: 1 100%;
`;

const VaultDetailView = styled(ViewContainer)`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

export interface VaultDetailRouteParams {
  vaultAddress: string;
}

export const VaultDetail = () => {
  // const { t } = useAppTranslation('common');
  const history = useHistory();

  const selectedVault = useAppSelector(VaultsSelectors.selectSelectedVault);
  const vaultsStatus = useAppSelector(VaultsSelectors.selectVaultsStatus);
  const tokensStatus = useAppSelector(TokensSelectors.selectWalletTokensStatus);

  const generalLoading = vaultsStatus.loading || tokensStatus.loading;

  const chartData = [
    {
      id: 'japan',
      // color: '#d9269a',
      data: [
        { x: '2019-05-01', y: 2 },
        { x: '2019-06-01', y: 7 },
        { x: '2019-06-15', y: 17 },
        { x: '2019-06-23', y: 1 },
        { x: '2019-08-01', y: 42 },
        { x: '2019-09-01', y: 1 },
      ],
    },
  ];

  return (
    <VaultDetailView>
      <ViewHeader>
        <BackButton onClick={() => history.push(`/vaults`)}>Back to Vaults Page</BackButton>
      </ViewHeader>

      {generalLoading && <SpinnerLoading flex="1" width="100%" height="100%" />}

      {!generalLoading && selectedVault && <VaultDetailPanels selectedVault={selectedVault} chartData={chartData} />}
    </VaultDetailView>
  );
};
