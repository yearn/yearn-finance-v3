import { FC } from 'react';
import styled from 'styled-components';

import { styledSystem, StyledSystemProps } from '../styledSystem';

export interface TextProps extends StyledSystemProps {
  center?: boolean;
  ellipsis?: boolean;
}

const StyledDiv = styled.span<StyledSystemProps & { ellipsis?: boolean }>`
  ${({ ellipsis }) =>
    ellipsis &&
    `
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `}

  ${styledSystem}
`;

export const Text: FC<TextProps> = ({ center, textColor, ellipsis, ...props }) => (
  <StyledDiv
    display={center ? 'flex' : null}
    flexDirection={center ? 'column' : null}
    justifyContent={center ? 'center' : null}
    alignItems={center ? 'center' : null}
    textAlign={center ? 'center' : null}
    ellipsis={ellipsis}
    {...props}
  />
);
