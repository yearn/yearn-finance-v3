import { useContext } from 'react';
import styled from 'styled-components';

import { BladeContext } from '@context';
import { Sidemenu, Icon, DeleteIcon } from '@components/common';

const StyledBlade = styled(Sidemenu)`
  width: 63.5rem;
  max-width: 100%;
  background-color: ${(props) => props.theme.blade.background};
  mix-blend-mode: normal;
  backdrop-filter: blur(${(props) => props.theme.blade.blur});
  padding: 4.7rem 3.6rem;
`;

const BladeContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 ${(props) => props.theme.navbar.padding};
  margin-top: 3.7rem;
`;

const StyledMenuButton = styled.div`
  position: absolute;
  right: 2.9rem;
  top: 2.2rem;
  padding: 1rem;
  margin-right: -1rem;
  flex-shrink: 0;
  cursor: pointer;
  user-select: none;

  img {
    height: 1.4rem;
  }
`;

interface BladeProps {
  data?: object;
}

export const BladeDump = ({ data }: BladeProps) => {
  const { isOpen, toggle } = useContext(BladeContext);

  if (!data) return null;

  return (
    <StyledBlade open={isOpen}>
      <StyledMenuButton onClick={toggle}>
        <Icon Component={DeleteIcon} />
      </StyledMenuButton>

      <BladeContent>
        <pre>
          <code>{JSON.stringify(data, null, ' ')}</code>
        </pre>
      </BladeContent>
    </StyledBlade>
  );
};
