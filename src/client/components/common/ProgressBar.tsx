import { FC } from 'react';
import styled from 'styled-components';
import { styledSystem, StyledSystemProps } from '@components/common/styledSystem';

export interface ProgressBarProps extends StyledSystemProps {
  value: number;
  diffValue?: number;
  maxValue?: number; // If not defined, maxValue = 100 (usefull for percents)
}

const StyledProgressBar = styled.div`
  --progress-bar-background: ${({ theme }) => theme.colors.txModalColors.onBackgroundVariant};
  --progress-bar-value-bg: ${({ theme }) => theme.colors.txModalColors.primary};
  --progress-bar-positive-bg: ${({ theme }) => theme.colors.txModalColors.success};
  --progress-bar-negative-bg: ${({ theme }) => theme.colors.txModalColors.loading};

  display: flex;
  background: var(--progress-bar-background);
  width: 100%;
  height: 1.2rem;
  border-radius: ${({ theme }) => theme.globalRadius};
  position: relative;
  overflow: hidden;

  ${styledSystem}
`;

const Bar = styled.div<{ value: number; maxValue: number; diffBarType?: 'positive' | 'negative' }>`
  width: ${(props) => (props.value / props.maxValue) * 100}%;
  height: 100%;
  background: var(--progress-bar-value-bg);
  border-radius: ${({ theme }) => theme.globalRadius};
  transition: width 500ms ease-in-out;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;

  ${({ diffBarType }) =>
    diffBarType === 'positive' &&
    `
    background: var(--progress-bar-positive-bg);
  `};
  ${({ diffBarType }) =>
    diffBarType === 'negative' &&
    `
    background:  var(--progress-bar-negative-bg);
    z-index: 0;
  `};
`;

export const ProgressBar: FC<ProgressBarProps> = ({ value, diffValue, maxValue = 100, ...props }) => {
  // NOTE usefull if you want to show the diff bar only when diffPercentage in % > x
  // const diffPercentage = diffValue ? ((value - diffValue) / maxValue) * 100 : 0;

  let diffBar;
  if (diffValue && diffValue !== value) {
    diffBar = <Bar value={diffValue} maxValue={maxValue} diffBarType={value > diffValue ? 'positive' : 'negative'} />;
  }

  return (
    <StyledProgressBar {...props}>
      <Bar value={value} maxValue={maxValue} />

      {diffBar}
    </StyledProgressBar>
  );
};
