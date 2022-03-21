import { FC, useState } from 'react';
import styled from 'styled-components';

import { getConfig } from '@config';
import { useAppDispatch, useAppSelector } from '@hooks';
import { ThemeActions } from '@store';
import { getTheme } from '@themes';
import { Theme } from '@types';
import { ThemeBox } from '@components/app';
import { Card, Modal, Tabs, Tab, TabPanel } from '@components/common';

const CustomThemesList = styled(Card)`
  display: grid;
  grid-auto-rows: min-content;
  grid-template-columns: repeat(auto-fill, minmax(12.8rem, 0fr));
  justify-content: space-between;
  grid-gap: 1.2rem;
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  margin-top: 1.2rem;
  padding: 2.8rem 2.3rem;
  overflow: hidden;
  overflow-y: auto;
`;

const StyledTabPanel = styled(TabPanel)`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const StyledTabs = styled(Tabs)`
  margin-top: 1.3rem;
  height: 3.2rem;
`;

const StyledCommunityThemesModal = styled(Modal)`
  display: flex;
  flex-direction: column;
  width: 38.5rem;
  height: 52rem;
  background-color: ${({ theme }) => theme.colors.surface};
`;
export interface CommunityThemesModalProps {
  onClose: () => void;
}

export const CommunityThemesModal: FC<CommunityThemesModalProps> = ({ onClose, ...props }) => {
  const dispatch = useAppDispatch();
  const { AVAILABLE_CUSTOM_THEMES, SUPPORTED_LANGS } = getConfig();

  const currentTheme = useAppSelector(({ theme }) => theme.current);
  const changeTheme = (theme: Theme) => dispatch(ThemeActions.changeTheme({ theme }));

  const [selectedTab, setSelectedTab] = useState('community');

  return (
    <StyledCommunityThemesModal header="Custom Theme Gallery" onClose={onClose} {...props}>
      <StyledTabs value={selectedTab} onChange={setSelectedTab}>
        <Tab value="community">Community</Tab>
        {/* <Tab value="favorites" disabled>
          Favorites
        </Tab> */}
      </StyledTabs>

      <StyledTabPanel value="community" tabValue={selectedTab}>
        <CustomThemesList>
          {AVAILABLE_CUSTOM_THEMES.map((theme: Theme, index) => (
            <ThemeBox
              themePallete={getTheme(theme)}
              name={theme}
              key={index}
              selected={theme === currentTheme}
              onClick={() => changeTheme(theme)}
            />
          ))}
        </CustomThemesList>
      </StyledTabPanel>
    </StyledCommunityThemesModal>
  );
};
