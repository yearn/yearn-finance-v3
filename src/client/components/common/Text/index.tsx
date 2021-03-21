import { FC } from 'react';
import styled from 'styled-components';

import { styledSystem, StyledSystemProps } from '../styledSystem';

export interface TextProps extends StyledSystemProps {
  center?: boolean;
}

const StyledDiv = styled.div<StyledSystemProps>`
  ${styledSystem}
`;

export const Text: FC<TextProps> = ({ center, textColor, ...props }) => (
  <StyledDiv
    display={center ? 'flex' : null}
    flexDirection={center ? 'column' : null}
    justifyContent={center ? 'center' : null}
    alignItems={center ? 'center' : null}
    textAlign={center ? 'center' : null}
    textColor={textColor ?? 'onPrimary'}
    {...props}
  />
);
