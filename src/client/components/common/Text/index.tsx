import { FC } from 'react';
import styled, { css } from 'styled-components';

import { styledSystem, StyledSystemProps } from '../styledSystem';

type HeadingType = 'h1' | 'h2' | 'h3';

const h1Mixin = css`
  font-size: 2.4rem;
  font-weight: 500;
`;

const h2Mixin = css`
  font-size: 2.4rem;
  line-height: 3.2rem;
  font-weight: bold;
`;

const h3Mixin = css`
  font-weight: bold;
`;

const StyledDiv = styled.div<StyledSystemProps & { ellipsis?: boolean; heading?: HeadingType }>`
  color: ${({ heading, theme }) => (heading ? theme.colors.titles : null)};
  ${({ heading }) => heading === 'h1' && h1Mixin}
  ${({ heading }) => heading === 'h2' && h2Mixin}
  ${({ heading }) => heading === 'h3' && h3Mixin}
  ${({ ellipsis }) =>
    ellipsis &&
    `
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    `}
  ${styledSystem}
`;

export interface TextProps extends StyledSystemProps {
  heading?: HeadingType;
  center?: boolean;
  ellipsis?: boolean;
}

export const Text: FC<TextProps> = ({ heading, center, textColor, ellipsis, ...props }) => (
  <StyledDiv
    as={heading}
    heading={heading}
    display={center ? 'flex' : null}
    flexDirection={center ? 'column' : null}
    justifyContent={center ? 'center' : null}
    alignItems={center ? 'center' : null}
    textAlign={center ? 'center' : null}
    ellipsis={ellipsis}
    {...props}
  />
);
