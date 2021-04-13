import { useState, useEffect } from 'react';
import { getTheme } from '../themes';

const MOBILE_WIDTH: number = getTheme().devices.mobile;

export interface Dimension {
  width: number;
  height: number;
  isMobile: boolean;
}

function getWindowDimensions(): Dimension {
  const dimensions: Dimension = {
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth <= MOBILE_WIDTH,
  };
  return dimensions;
}

export default function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}
