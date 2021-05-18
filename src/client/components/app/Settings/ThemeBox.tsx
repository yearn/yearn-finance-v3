import styled, { DefaultTheme } from 'styled-components';
import { Theme } from '@types';

import { useAppTranslation } from '@hooks';

const StyledThemeBox = styled.div<{ themePallete: DefaultTheme; selected?: boolean }>`
  display: flex;
  flex-direction: column;
  background-color: ${(props) => props.themePallete.colors.primary};
  color: ${(props) => props.themePallete.colors.primaryVariant};
  min-width: 10rem;
  max-width: 40rem;
  border-radius: 1rem;
  overflow: hidden;
  border: 3px solid transparent;
  cursor: ${(props) => (props.onClick ? 'pointer' : 'default')};
  user-select: none;

  ${(props) =>
    props.selected &&
    `
    cursor: default;
    border-color: ${props.theme.colors.onSurface};
  `};

  .themebox-header {
    padding: 1rem;
  }
  .themebox-content {
    background: ${(props) => props.themePallete.colors.surface};
    color: ${(props) => props.themePallete.colors.onSurface};
    min-height: 10rem;
    padding: 1rem;
  }
`;

interface ThemeBoxProps {
  themePallete: DefaultTheme;
  name: Theme;
  selected?: boolean;
  onClick?: () => void;
}

export const ThemeBox = ({ themePallete, name, selected, onClick }: ThemeBoxProps) => {
  const { t } = useAppTranslation('common');
  /* border: 1px solid ${({ theme }) => theme.colors.onSurface} .themebox-header { */
  return (
    <StyledThemeBox themePallete={themePallete} selected={selected} onClick={onClick}>
      {selected}
      <div className="themebox-header">{t(`themes.${name}`)}</div>
      <div className="themebox-content">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.
      </div>
    </StyledThemeBox>
  );
};
