import { FC } from 'react';
import styled from 'styled-components';

import { styledSystem, StyledSystemProps } from '../styledSystem';

export interface BoxProps extends StyledSystemProps {
  center?: boolean;
  gap?: string;
}

const StyledDiv = styled.div<BoxProps>`
  gap: ${({ gap }) => gap ?? null};
  ${styledSystem};
`;

export const Box: FC<BoxProps> = ({ center, gap, ...props }) => (
  <StyledDiv
    display={center ? 'flex' : null}
    flexDirection={center ? 'column' : null}
    justifyContent={center ? 'center' : null}
    alignItems={center ? 'center' : null}
    gap={gap}
    {...props}
  />
);
