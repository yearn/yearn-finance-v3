import { css } from 'styled-components';

export const halfWidthCss = css`
  max-width: calc(${({ theme }) => theme.globalMaxWidth} / 2 - ${({ theme }) => theme.layoutPadding} / 2);
`;
