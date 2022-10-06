import styled from 'styled-components';

import { useAppTranslation } from '@hooks';
import { Button } from '@components/common';

const ZapMessageContainer = styled.div`
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

const ZappableTokensList = styled.div`
  display: flex;
  // NOTE This will make the list with css grid, an alternative to flexbox wrapping.
  // We should leave this piece of code here because I think we will need to change the style.
  // grid-template-columns: repeat(auto-fit, minmax(3rem, max-content));
  // grid-auto-flow: column;
  // flex-wrap: wrap;
  overflow: hidden;
  margin-top: 0.8rem;
  grid-gap: 0.8rem;
  width: 100%;
`;

const ZappableTokenButton = styled(Button)<{ selected?: boolean; viewAll?: boolean }>`
  display: block;
  font-size: 1.2rem;
  height: 2.4rem;
  padding: 0 0.8rem;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  width: -webkit-fill-available;
  // NOTE - hack fallback if fill-available is not supported
  max-width: 6.6rem;
  max-width: max-content;

  ${({ selected, theme }) =>
    selected &&
    `
      background-color: ${theme.colors.secondary};
      color: ${theme.colors.titlesVariant};
    `}
  ${({ viewAll }) =>
    viewAll &&
    `
      flex-shrink: 0;
    `}
`;

interface Item {
  id: string;
  icon?: string;
  label: string;
  value?: string;
}

interface ZapTransactionControlProps {
  zapTokens: Item[];
  selectedToken: Item;
  onSelectedTokenChange?: (address: string) => void;
  onViewAll?: () => void;
}

export const ZapTransactionControls = ({
  zapTokens,
  selectedToken,
  onSelectedTokenChange,
  onViewAll,
}: ZapTransactionControlProps) => {
  const { t } = useAppTranslation('common');

  return (
    <ZapMessageContainer>
      {t('components.transaction.zap-guidance.desc')}

      <ZappableTokensList>
        {zapTokens.map((item) => (
          <ZappableTokenButton
            key={item.id}
            outline
            selected={item.id === selectedToken.id}
            onClick={() => (onSelectedTokenChange ? onSelectedTokenChange(item.id) : undefined)}
          >
            {item.label}
          </ZappableTokenButton>
        ))}

        <ZappableTokenButton viewAll outline onClick={onViewAll}>
          {t('components.transaction.zap-guidance.view-all')}
        </ZappableTokenButton>
      </ZappableTokensList>
    </ZapMessageContainer>
  );
};
