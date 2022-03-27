import { FC } from 'react';
import styled from 'styled-components/macro';

import { styledSystem, StyledSystemProps } from '../styledSystem';

export interface BoxProps extends StyledSystemProps {
  center?: boolean;
}

const StyledDiv = styled.div<StyledSystemProps>`
  ${styledSystem}
`;

export const Box: FC<BoxProps> = ({ center, ...props }) => (
  <StyledDiv
    display={center ? 'flex' : null}
    flexDirection={center ? 'column' : null}
    justifyContent={center ? 'center' : null}
    alignItems={center ? 'center' : null}
    {...props}
  />
);
