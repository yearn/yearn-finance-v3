import { FC, useState } from 'react';
import styled from 'styled-components';

import { Modal, Tabs, Tab, TabPanel } from '@components/common';

const StyledCommunityThemesModal = styled(Modal)`
  width: 38.5rem;
`;
export interface CommunityThemesModalProps {
  onClose: () => void;
}

export const CommunityThemesModal: FC<CommunityThemesModalProps> = ({ onClose, ...props }) => {
  const [selectedTab, setSelectedTab] = useState('community');

  return (
    <StyledCommunityThemesModal header="Custom Theme Gallery" onClose={onClose} {...props}>
      <Tabs value={selectedTab} onChange={setSelectedTab}>
        <Tab value="community">Community</Tab>
        {/* <Tab value="favorites" disabled>
          Favorites
        </Tab> */}
      </Tabs>
      <TabPanel value="community" tabValue={selectedTab}>
        test
      </TabPanel>
    </StyledCommunityThemesModal>
  );
};
