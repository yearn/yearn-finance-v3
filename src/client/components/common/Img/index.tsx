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
    let isMounted = true;
    let image: HTMLImageElement | null = new Image();
    image.src = src ?? '';
    if (!image.complete && isMounted) setLoaded(false);
    image.onload = () => {
      if (isMounted) setLoaded(true);
      image = null;
    };

    return () => {
      isMounted = false;
      image = null;
    };
  }, [src]);

  return <StyledImg src={src} alt={alt} loaded={loaded} {...props} />;
};
