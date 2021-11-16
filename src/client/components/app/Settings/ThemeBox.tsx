import styled, { DefaultTheme } from 'styled-components';

import { useAppTranslation } from '@hooks';
import { Theme } from '@types';

const ThemeName = styled.span`
  font-size: 1.2rem;
  text-align: center;
  padding: 1rem;
  flex: 1;
`;

const ThemePreview = styled.div<{ selected?: boolean; themePallete: DefaultTheme }>`
  display: flex;
  background-color: ${(props) => props.themePallete.colors.background};
  color: ${(props) => props.themePallete.colors.primaryVariant};
  min-width: 10rem;
  width: 12.8rem;
  height: 6.4rem;
  border-radius: 0.6rem;
  overflow: hidden;
  border: 2px solid transparent;
  padding: 0.6rem;
  user-select: none;

  * {
    border-radius: 0.4rem;
  }

  .themebox-sidebar {
    width: 1.6rem;
    height: 100%;
    background-color: ${(props) => props.themePallete.colors.primary};
    margin-right: 0.4rem;
  }
  .themebox-content {
    display: grid;
    grid-auto-rows: auto 1fr;
    gap: 0.4rem;
    flex: 1;
    height: 100%;

    .content-portfolio {
      display: flex;
      align-items: center;
      padding: 0 1rem;
      background: ${(props) => props.themePallete.colors.secondaryVariantA};
      height: 1.6rem;
      font-size: 1rem;
    }
    .content-card {
      background: ${(props) => props.themePallete.colors.surface};
      flex: 1;
      overflow: hidden;
      position: relative;

      &:after {
        content: '';
        width: 100%;
        height: 0.6rem;
        margin-top: 0.6rem;
        background: ${(theme) => theme.themePallete.colors.selectionBar};
        position: absolute;
      }
    }
  }
`;

const StyledThemeBox = styled.div<{ selected?: boolean }>`
  display: flex;
  flex-direction: column;
  cursor: ${(props) => (props.onClick && !props.selected ? 'pointer' : 'default')};
  border-radius: ${({ theme }) => theme.globalRadius};
  border: 2px solid transparent;
  overflow: hidden;

  ${(props) =>
    props.selected &&
    `
    background-color: ${props.theme.colors.secondary};
    border-color: ${props.theme.colors.secondary};
    color: ${props.theme.colors.surface};
  `};
`;

interface ThemeBoxProps {
  themePallete: DefaultTheme;
  name: Theme;
  selected?: boolean;
  onClick?: () => void;
}

export const ThemeBox = ({ themePallete, name, selected, onClick }: ThemeBoxProps) => {
  const { t } = useAppTranslation('common');

  return (
    <StyledThemeBox selected={selected} onClick={onClick}>
      <ThemePreview selected={selected} themePallete={themePallete}>
        <div className="themebox-sidebar"></div>
        <div className="themebox-content">
          <div className="content-portfolio"></div>
          <div className="content-card"></div>
        </div>
      </ThemePreview>

      <ThemeName>{t(`themes.${name}`)}</ThemeName>
    </StyledThemeBox>
  );
};
