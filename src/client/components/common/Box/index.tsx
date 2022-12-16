import { FC } from 'react';
import styled from 'styled-components';

import { styledSystem, StyledSystemProps } from '../styledSystem';

export interface BoxProps extends StyledSystemProps {
  center?: boolean;
  gap?: string;
  onClick?: () => void;
  onBlur?: () => void;
}

const StyledDiv = styled.div<BoxProps>`
  gap: ${({ gap }) => gap ?? null};
  ${styledSystem};
`;

export const Box: FC<BoxProps> = ({ center, gap, onClick, onBlur, ...props }) => (
  <StyledDiv
    display={center ? 'flex' : null}
    flexDirection={center ? 'column' : null}
    justifyContent={center ? 'center' : null}
    alignItems={center ? 'center' : null}
    gap={gap}
    onClick={onClick}
    onBlur={onBlur}
    {...props}
  />
);
