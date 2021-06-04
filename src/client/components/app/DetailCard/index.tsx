import { ReactNode } from 'react';
import styled from 'styled-components';

import { Card, CardHeader, CardContent, CardElement } from '@components/common';

const StyledCard = styled(Card)`
  padding: 1.2rem 0;
`;

interface Metadata {
  key: string;
  header?: string;
  align?: 'flex-start' | 'center' | 'flex-end';
  width?: string;
  grow?: '1' | '0';
  transform?: (data: Data) => ReactNode;
}

interface Data {
  [key: string]: string;
}

interface DetailCardProps {
  header: string;
  metadata: Metadata[];
  data: Data[];
  SearchBar?: ReactNode;
}

export const DetailCard = ({ header, metadata, data, SearchBar }: DetailCardProps) => {
  if (data.length === 0 && !SearchBar) {
    return null;
  }

  return (
    <StyledCard>
      <CardHeader header={header} />
      {SearchBar}
      <CardContent>
        {metadata.map(({ key, header, width, align, grow }) => (
          <CardElement key={key} header={header} width={width} align={align} grow={grow} />
        ))}
      </CardContent>
      {data.map((item, i) => (
        <CardContent key={`content-${i}`}>
          {metadata.map(({ key, width, align, grow, transform }) => (
            <CardElement
              key={`element-${key}-${i}`}
              content={transform ? undefined : item[key]}
              width={width}
              align={align}
              grow={grow}
            >
              {transform && transform(item)}
            </CardElement>
          ))}
        </CardContent>
      ))}
    </StyledCard>
  );
};
