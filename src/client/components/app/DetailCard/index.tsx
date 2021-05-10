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
  transform?: () => ReactNode;
}

interface Data {
  [key: string]: string;
}

interface DetailCardProps {
  header: string;
  metadata: Metadata[];
  data: Data[];
}

export const DetailCard = ({ header, metadata, data }: DetailCardProps) => {
  return (
    <StyledCard>
      <CardHeader header={header} />
      <CardContent>
        {metadata.map(({ key, header, width, align, grow }) => (
          <CardElement key={key} header={header} width={width} align={align} grow={grow} />
        ))}
      </CardContent>
      <CardContent>
        {data.map((item, i) => {
          return metadata.map(({ key, width, align, grow, transform }) => (
            <CardElement key={`${key}-${i}`} content={item[key]} width={width} align={align} grow={grow}>
              {transform && transform()}
            </CardElement>
          ));
        })}
      </CardContent>
    </StyledCard>
  );
};
