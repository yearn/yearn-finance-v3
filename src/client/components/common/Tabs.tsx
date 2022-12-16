import React, { FC } from 'react';
import styled from 'styled-components';

import { transitionCss } from '@utils';

import { Box } from './Box';
import { motion } from './Motion';
import { styledSystem, StyledSystemProps } from './styledSystem';

export interface TabsProps extends StyledSystemProps {
  value: number | string;
  onChange: (value: any) => void;
}

const StyledTabs = styled.div`
  --tabs-selected-bg: transparent;
  --tabs-selected-color: ${({ theme }) => theme.colors.titlesVariant};
  --tabs-color: ${({ theme }) => theme.colors.texts};

  display: flex;
  align-items: center;
  justify-content: center;
  height: 5.6rem;
  font-size: 2rem;
  font-weight: 400;
  text-align: center;
  background: transparent;
  color: var(--tabs-color);
  border-bottom: 2px solid ${({ theme }) => theme.colors.surfaceVariant};
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

const StyledTab = styled.div<{ selected?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: inherit;
  font-weight: inherit;
  text-align: inherit;
  text-transform: inherit;
  border-radius: inherit;
  background: inherit;
  cursor: pointer;
  margin: 0 2rem;
  ${transitionCss}

  ${({ selected }) =>
    selected &&
    `
    background: var(--tabs-selected-bg);
    color: var(--tabs-selected-color);
    font-weight: 700;
    cursor: default;
  `};

  ${styledSystem}
`;

const StyledLine = styled(motion.div)<{ transparent?: boolean }>`
  width: 100%;
  border-bottom: 3px solid var(--tabs-selected-color);
  ${({ transparent }) =>
    transparent &&
    `
    border-bottom: 3px solid transparent;
  `};
`;

export interface TabProps extends StyledSystemProps {
  value?: number | string;
  label?: string;
  selected?: boolean;
  disabled?: boolean;
  onChange?: (value: any) => void;
}

export const Tab: FC<TabProps> = ({ value, selected, onChange, children, ...props }) => {
  const handleClick = () => {
    if (!selected && onChange) {
      onChange(value);
    }
  };

  return (
    <StyledTab key={value} selected={selected} onClick={handleClick} {...props}>
      <Box center flexGrow={1}>
        {children}
      </Box>
      {!selected && <StyledLine transparent />}
      {selected && <StyledLine layoutId="tab-label-underline" />}
    </StyledTab>
  );
};

export interface TabPanelProps extends StyledSystemProps {
  value: number | string;
  tabValue: number | string;
}

const StyledTabPanel = styled.div<{ hidden?: boolean }>`
  ${({ hidden }) => (hidden ? 'display: none;' : 'display: flex; flex: 1;')}
  ${styledSystem}
`;

export const TabPanel: FC<TabPanelProps> = ({ value, tabValue, children, ...props }) => (
  <StyledTabPanel hidden={value !== tabValue} {...props}>
    {children}
  </StyledTabPanel>
);
