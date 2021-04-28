import styled from 'styled-components';

import { Button, Text } from '@components/common';
import { ListCard, ListCardsWrapper, ListHeaders } from '@src/client/components/app/AssetLists';
import { useAppTranslation } from '@hooks';

const StyledDepositsList = styled.div<{ className?: string }>`
  --asset-list-columns: 1fr 1fr 1fr 1fr 2fr;
  --asset-list-padding: 1.1rem;

  display: flex;
  flex-direction: column;
  width: 100%;
`;

interface Asset {
  icon: string;
  name: string;
  deposited: string;
  wallet: string;
  roi: string;
  onWithdraw?: () => void;
  onInvest?: () => void;
  onInfo?: () => void;
}

interface DepositListProps {
  assets: Asset[];
}

export const DepositsList = ({ assets, ...props }: DepositListProps) => {
  const { t } = useAppTranslation('common');

  return (
    <StyledDepositsList>
      <h4>{t('asset-lists.deposits')}</h4>

      <ListHeaders>
        <span>{t('asset-lists.headers.asset')}</span>
        <span>{t('asset-lists.headers.deposited')}</span>
        <span>{t('asset-lists.headers.wallet')}</span>
        <span>{t('asset-lists.headers.roi')}</span>
        <span></span>
        <span></span>
        <span></span>
      </ListHeaders>

      <ListCardsWrapper>
        {assets.map((asset, index) => {
          return (
            <ListCard key={index}>
              <div className="icon-col">
                <img src={asset.icon} alt={asset.name} />
                <span>{asset.name}</span>
              </div>
              <Text>{asset.deposited}</Text>
              <Text>{asset.wallet}</Text>
              <Text>{asset.roi}</Text>
              <div className="actions-col">
                <Button onClick={() => asset.onWithdraw && asset.onWithdraw()} className="outline">
                  <Text>Withdraw</Text>
                </Button>
                <Button onClick={() => asset.onInvest && asset.onInvest()} className="outline">
                  <Text>Invest</Text>
                </Button>
                <Button onClick={() => asset.onInfo && asset.onInfo()} className="outline">
                  <Text>Info</Text>
                </Button>
              </div>
            </ListCard>
          );
        })}
      </ListCardsWrapper>
    </StyledDepositsList>
  );
};
