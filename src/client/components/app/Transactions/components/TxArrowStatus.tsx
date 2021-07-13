import { FC } from 'react';
import styled from 'styled-components';

import { Icon, StatusArrowIcon } from '@components/common';

export type TxArrowStatusTypes = 'preparing' | 'firstPending' | 'secondPreparing' | 'secondPending';

export interface TxArrowStatusProps {
  status?: TxArrowStatusTypes;
}

const IconBlur = styled(Icon)`
  position: absolute;
  transition: filter 300ms ease-in-out;
`;

const StyledTxArrowStatus = styled.div<{ status?: TxArrowStatusTypes }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  position: relative;
  overflow: visible;

  ${Icon} {
    height: 4.8rem;
    fill: inherit;
    flex-shrink: 0;
    transition: fill 300ms ease-in-out;
  }
  ${({ status, theme }) => {
    let arrowColor = theme.colors.txModalColors.text;
    let blur = false;
    let animation = false;

    if (status === 'preparing') {
      arrowColor = theme.colors.txModalColors.text;
    } else if (status === 'firstPending') {
      arrowColor = theme.colors.txModalColors.textContrast;
      blur = true;
      animation = true;
    } else if (status === 'secondPreparing') {
      arrowColor = theme.colors.txModalColors.textContrast;
    } else if (status === 'secondPending') {
      arrowColor = theme.colors.txModalColors.loading;
      blur = true;
      animation = true;
    }
    const animationCss = animation ? 'animation: pulse 4s ease-in-out alternate infinite;' : undefined;

    const css = `
      fill: ${arrowColor};
      ${animationCss};
    `;

    if (blur) {
      return `
        ${css};

        ${IconBlur} {
          filter: blur(0.6rem);
        }
      `;
    } else {
      return css;
    }
  }}

  @keyframes pulse {
    0% {
      opacity: 1;
    }

    50% {
      opacity: 0.3;
    }

    100% {
      opacity: 1;
    }
  }
`;

export const TxArrowStatus: FC<TxArrowStatusProps> = ({ status, children, ...props }) => (
  <StyledTxArrowStatus status={status} {...props}>
    <Icon Component={StatusArrowIcon} />
    <IconBlur Component={StatusArrowIcon} />
  </StyledTxArrowStatus>
);
