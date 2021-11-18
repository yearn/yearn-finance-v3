import React, { FC } from 'react';
import styled from 'styled-components';

import { styledSystem, StyledSystemProps } from './styledSystem';

export interface TabsProps extends StyledSystemProps {
  value: number | string;
  onChange: (value: any) => void;
}

const StyledTabs = styled.div`
  --tabs-selected-bg: ${({ theme }) => theme.colors.secondary};
  --tabs-selected-color: ${({ theme }) => theme.colors.background};

  display: flex;
  height: 3.2rem;
  font-size: 1.4rem;
  font-weight: 500;
  text-align: center;
  text-transform: uppercase;
  border-radius: ${({ theme }) => theme.globalRadius};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.onSurfaceH2};
  overflow: hidden;
  user-select: none;

  ${styledSystem}
`;

export const Tabs: FC<TabsProps> = ({ value, onChange, children, ...props }) => {
  let childIndex = 0;

  const childrenElements = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) {
      return null;
    }

    const childValue = child.props.value ?? childIndex;
    const selected = childValue === value;

    childIndex += 1;
    return React.cloneElement(child, {
      selected,
      onChange,
      value: childValue,
    });
  });

  return <StyledTabs {...props}>{childrenElements}</StyledTabs>;
};

export interface TabProps extends StyledSystemProps {
  value?: number | string;
  selected?: boolean;
  disabled?: boolean;
  onChange?: (value: any) => void;
}

const StyledTab = styled.div<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  flex: 1;
  font-size: inherit;
  font-weight: inherit;
  text-align: inherit;
  text-transform: inherit;
  border-radius: inherit;
  background: inherit;
  cursor: pointer;

  ${({ selected }) =>
    selected &&
    `
    background: var(--tabs-selected-bg);
    color: var(--tabs-selected-color);
    cursor: default;
  `};

  ${styledSystem}
`;

export const Tab: FC<TabProps> = ({ value, selected, onChange, children, ...props }) => {
  const handleClick = () => {
    if (!selected && onChange) {
      onChange(value);
    }
  };

  return (
    <StyledTab key={value} selected={selected} onClick={handleClick} {...props}>
      {children}
    </StyledTab>
  );
};

export interface TabPanelProps extends StyledSystemProps {
  value: number | string;
  tabValue: number | string;
}

const StyledTabPanel = styled.div<{ hidden?: boolean }>`
  ${styledSystem}
`;

export const TabPanel: FC<TabPanelProps> = ({ value, tabValue, children, ...props }) => (
  <StyledTabPanel hidden={value !== tabValue} {...props}>
    {children}
  </StyledTabPanel>
);
