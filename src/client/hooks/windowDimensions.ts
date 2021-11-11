import { useState, useEffect } from 'react';

import { getTheme } from '../themes';

export interface Dimension {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

function getWindowDimensions(): Dimension {
  const dimensions: Dimension = {
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth <= getTheme().devices.mobile,
    isTablet: window.innerWidth <= getTheme().devices.tablet,
    isDesktop: window.innerWidth <= getTheme().devices.desktop,
  };
  return dimensions;
}

export const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
};
