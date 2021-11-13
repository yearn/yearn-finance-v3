import styled from 'styled-components';

import { Icon, AddIcon } from '@components/common';

const StyledIcon = styled(Icon)`
  width: 2.8rem;
`;

const StyledCustomThemeButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.globalRadius};
  min-width: 10rem;
  width: 24rem;
  height: 12rem;
  cursor: pointer;
`;

interface CustomThemeButtonProps {
  onClick?: () => void;
}

export const CustomThemeButton = ({ onClick }: CustomThemeButtonProps) => {
  return (
    <StyledCustomThemeButton onClick={onClick}>
      <StyledIcon Component={AddIcon} />
    </StyledCustomThemeButton>
  );
};
