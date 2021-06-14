import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { get } from 'lodash';

import { SearchIcon, Input } from '@components/common';

const StyledSearchInput = styled(Input)``;

interface SearchInputProps<T> {
  searchableData: Array<T>;
  searchableKeys: Array<keyof T | string>;
  placeholder?: string;
  onSearch: (data: Array<T>) => void;
}

export const SearchInput = <T,>({ searchableData, searchableKeys, placeholder, onSearch }: SearchInputProps<T>) => {
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const filteredData = searchableData.filter((item) => {
      const matches = searchableKeys.find((key) => {
        const text = get(item, key);
        if (typeof text === 'string') {
          return text.toLowerCase().includes(searchText.toLowerCase());
        }
        return false;
      });
      return !!matches;
    });
    onSearch(filteredData);
  }, [searchText]);

  return (
    <StyledSearchInput
      value={searchText}
      placeholder={placeholder}
      icon={SearchIcon}
      onChange={(e) => setSearchText(e.target.value)}
    />
  );
};
