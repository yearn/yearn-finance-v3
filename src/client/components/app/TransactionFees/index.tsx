import styled from 'styled-components';

import { useAppTranslation } from '@hooks';
import { Text, Tooltip, Icon, InfoIcon } from '@components/common';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border-radius: ${({ theme }) => theme.globalRadius};
  background: ${({ theme }) => theme.colors.txModalColors.backgroundVariant};
  padding: 0.8rem;
  font-size: 1.2rem;
  width: 100%;
  overflow: hidden;
`;

const Row = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledIcon = styled(Icon)`
  display: inline-block;
  margin-left: 0.2rem;
  flex-shrink: 0;
  fill: ${({ theme }) => theme.colors.txModalColors.warning.color};
`;

interface TransactionFeesProps {
  zapService?: string;
}

export const TransactionFees = ({ zapService }: TransactionFeesProps) => {
  const { t } = useAppTranslation('common');

  const showFees = !!zapService;

  if (!showFees) return null;

  return (
    <Container>
      <Row>
        <Text display="flex" justifyContent="center" alignItems="center">
          {t('components.transaction.fees.zaps')}
          <Tooltip
            placement="bottom"
            tooltipComponent={
              <Text fontSize="1.2rem">
                {t(
                  zapService?.includes('portals')
                    ? 'components.transaction.fees.powered-by-portals'
                    : 'components.transaction.fees.powered-by-wido'
                )}
              </Text>
            }
          >
            <StyledIcon Component={InfoIcon} size="1.5rem" />
          </Tooltip>
        </Text>
        <Text>0.3%</Text>
      </Row>
    </Container>
  );
};
