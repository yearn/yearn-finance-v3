import styled from 'styled-components';
import { DepositsList } from '@src/client/components/app/AssetLists';

// import { useAppTranslation } from '@hooks';

const InvestView = styled.div`
  display: flex;
  justify-content: center;
  flex: 1;
`;

const DefaultPageContent = styled.div`
  display: flex;
  flex-direction: column;
  max-width: ${({ theme }) => theme.globalMaxWidth};
  width: 100%;
  padding: 0 4rem;
  margin-top: 2.1rem;
  padding-bottom: 4rem;
`;

export const Invest = () => {
  // const { t } = useAppTranslation('common');

  const depositAssets = [
    {
      icon: 'test',
      name: 'USDC',
      deposited: '119.492',
      wallet: '42.430',
      roi: '45.52%',
      onWithdraw: () => console.log('withdraw'),
      onInvest: () => console.log('invest'),
      onInfo: () => console.log('info'),
    },
    {
      icon: 'test',
      name: 'USDC',
      deposited: '119.492',
      wallet: '42.430',
      roi: '45.52%',
      onWithdraw: () => console.log('withdraw'),
      onInvest: () => console.log('invest'),
      onInfo: () => console.log('info'),
    },
    {
      icon: 'test',
      name: 'USDC',
      deposited: '119.492',
      wallet: '42.430',
      roi: '45.52%',
      onWithdraw: () => console.log('withdraw'),
      onInvest: () => console.log('invest'),
      onInfo: () => console.log('info'),
    },
  ];

  return (
    <InvestView>
      <DefaultPageContent>
        <DepositsList assets={depositAssets} />
      </DefaultPageContent>
    </InvestView>
  );
};
