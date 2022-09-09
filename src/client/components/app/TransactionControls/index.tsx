import styled from 'styled-components';

import { useAppTranslation } from '@hooks';
import { Text, Tooltip, Icon, InfoIcon, ToggleButton } from '@components/common';

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

interface TransactionControlsProps {
  allowGasless?: boolean;
  isGasless?: boolean;
  onToggleGasless?: (state: boolean) => void;
}

export const TransactionControls = ({ allowGasless, isGasless, onToggleGasless }: TransactionControlsProps) => {
  const { t } = useAppTranslation('common');

  const showControls = !!allowGasless;

  if (!showControls) return null;

  return (
    <Container>
      <Row>
        <Text display="flex" justifyContent="center" alignItems="center">
          {t('components.transaction.controls.gasless')}
          <Tooltip
            placement="bottom"
            tooltipComponent={<Text fontSize="1.2rem">{t('components.transaction.controls.gasless-info')}</Text>}
          >
            <StyledIcon Component={InfoIcon} size="1.5rem" />
          </Tooltip>
        </Text>
        <ToggleButton
          selected={!!isGasless}
          setSelected={(selected) => {
            if (onToggleGasless) onToggleGasless(selected);
          }}
        />
      </Row>
    </Container>
  );
};
