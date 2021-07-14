import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';

import { Icon, ChevronLeftIcon, SearchInput } from '@components/common';
import { TokenIcon } from '@components/app';

const ItemLabel = styled.div`
  flex: 1;
`;

const ListItem = styled.div<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  cursor: pointer;
  border-radius: ${({ theme }) => theme.globalRadius};
  padding: 0.8rem;
  text-transform: uppercase;

  &:hover {
    background-color: ${({ theme }) => theme.searchList.primaryHover};
  }
  ${(props) =>
    props.selected &&
    `
    background-color: ${props.theme.searchList.primaryHover};
  `}
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-top: 0.8rem;
  font-size: 1.4rem;
  padding: 0 0.8rem;
  overflow: hidden;
  overflow-y: auto;
`;

const StyledSearchInput = styled(SearchInput)`
  --input-placeholder: ${({ theme }) => theme.searchList.primaryHover};
  background-color: ${({ theme }) => theme.searchList.primaryVariant};
  color: ${({ theme }) => theme.searchList.primaryHover};
  fill: ${({ theme }) => theme.searchList.primaryHover};
  border: 0;
`;

const BackButton = styled(Icon)`
  fill: inherit;
  height: 1.6rem;
  position: absolute;
  left: 0;
  padding: 1rem;
  margin-left: -1rem;
  box-sizing: content-box;
  cursor: pointer;
`;

const HeaderTitle = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  flex: 1;
  text-align: center;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const StyledSearchList = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.searchList.primary};
  color: ${({ theme }) => theme.searchList.onPrimary};
  fill: ${({ theme }) => theme.searchList.onPrimary};
  border-radius: ${({ theme }) => theme.globalRadius};
  padding: 1.6rem;
  gap: 1.6rem;
  max-height: 50rem;
  overflow: hidden;
  user-select: none;
  z-index: 1;
`;

export type SearchListItem = {
  id: string;
  icon?: string;
  label: string;
  value?: string;
};

export interface SearchListProps {
  headerText?: string;
  // TODO Check how to remove the any[] and not throw error on searchInput
  list: any[] | SearchListItem[];
  selected: SearchListItem;
  setSelected: (selected: SearchListItem) => void;
  onCloseList?: () => void;
}

export const SearchList: FC<SearchListProps> = ({ headerText, list, selected, setSelected, onCloseList, ...props }) => {
  const [filteredItems, setFilteredItems] = useState(list);

  useEffect(() => {
    setFilteredItems(list);
  }, [list]);

  const selectItem = (item: SearchListItem) => {
    setSelected(item);
    if (onCloseList) {
      onCloseList();
    }
  };

  return (
    <StyledSearchList {...props}>
      <Header>
        {onCloseList && <BackButton Component={ChevronLeftIcon} onClick={onCloseList} />}
        <HeaderTitle>{headerText || 'Select an item'}</HeaderTitle>
      </Header>

      <StyledSearchInput
        searchableData={list}
        searchableKeys={['id', 'label']}
        placeholder="Search"
        onSearch={(data) => setFilteredItems(data)}
      />

      <List>
        {filteredItems.map(
          (item: SearchListItem) =>
            item && (
              <ListItem key={item.id} onClick={() => selectItem(item)} selected={item.id === selected.id}>
                <TokenIcon icon={item.icon} symbol={item.label} size="big" />
                <ItemLabel>{item.label}</ItemLabel>
                {item.value}
              </ListItem>
            )
        )}
      </List>
    </StyledSearchList>
  );
};
