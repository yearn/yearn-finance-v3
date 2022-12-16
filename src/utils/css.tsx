import { css } from 'styled-components';

import { device } from '@themes/default';

export const halfWidthCss = css`
  width: calc(50% - ${({ theme }) => theme.layoutPadding} / 2);
  // max-width: calc(${({ theme }) => theme.globalMaxWidth} / 2 - ${({ theme }) => theme.layoutPadding} / 2);

  @media ${device.tablet} {
    width: 100%;
  }
`;

export const transitionCss = css`
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow,
    transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 0.2s;
`;
