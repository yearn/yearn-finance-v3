import styled from 'styled-components';

import { Icon, AddIcon } from '@components/common';

const ButtonText = styled.span`
  font-size: 1.2rem;
  text-align: center;
  padding: 1rem;
  flex: 1;
`;

const StyledIcon = styled(Icon)`
  width: 1.6rem;
  fill: currentColor;
`;

const AddButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed ${({ theme }) => theme.colors.titlesVariant};
  color: ${({ theme }) => theme.colors.titlesVariant};
  border-radius: ${({ theme }) => theme.globalRadius};
  min-width: 10rem;
  width: 12.8rem;
  height: 6.4rem;
  cursor: pointer;
`;

const StyledCustomThemeButton = styled.div`
  display: flex;
  flex-direction: column;
`;

interface CustomThemeButtonProps {
  onClick?: () => void;
}

export const CustomThemeButton = ({ onClick }: CustomThemeButtonProps) => {
  return (
    <StyledCustomThemeButton onClick={onClick}>
      <AddButton>
        <StyledIcon Component={AddIcon} />
      </AddButton>

      <ButtonText>Custom</ButtonText>
    </StyledCustomThemeButton>
  );
};
