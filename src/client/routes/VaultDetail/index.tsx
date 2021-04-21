import { useParams } from 'react-router-dom';
import styled from 'styled-components';

// import { useAppTranslation } from '@hooks';

const VaultDetailView = styled.div`
  display: flex;
  flex: 1;
`;

export interface VaultDetailRouteParams {
  vaultId: string;
}

export const VaultDetail = () => {
  const { vaultId } = useParams<VaultDetailRouteParams>();
  // const { t } = useAppTranslation('common');

  return <VaultDetailView>Vault: {vaultId}</VaultDetailView>;
};
