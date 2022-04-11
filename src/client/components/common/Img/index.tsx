import { useState, useEffect, ImgHTMLAttributes } from 'react';
import styled from 'styled-components';

const StyledImg = styled.img<{ loaded?: boolean }>`
  opacity: ${({ loaded }) => (loaded ? 1 : 0)};
  transition: 0.3s cubic-bezier(0.3, 0, 0.4, 1) opacity;
`;

interface ImgProps extends ImgHTMLAttributes<HTMLImageElement> {}

export const Img = ({ alt, src, ...props }: ImgProps) => {
  const [loaded, setLoaded] = useState(true);

  useEffect(() => {
    const image = new Image();
    image.src = src ?? '';
    if (!image.complete) setLoaded(false);
    image.onload = () => setLoaded(true);
  }, [src]);

  return <StyledImg src={src} alt={alt} loaded={loaded} {...props} />;
};
