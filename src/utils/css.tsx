import { css } from 'styled-components';
import { device } from '@themes/default';

export const halfWidthCss = css`
  width: calc(50% - ${({ theme }) => theme.layoutPadding} / 2);
  // max-width: calc(${({ theme }) => theme.globalMaxWidth} / 2 - ${({ theme }) => theme.layoutPadding} / 2);

  @media ${device.tablet} {
    width: 100%;
  }
`;
