import { useEffect } from 'react';
import NProgress from 'nprogress';

interface PageProgressBarProps {
  isLoading?: boolean;
}

export const PageProgressBar = ({ isLoading }: PageProgressBarProps) => {
  useEffect(() => {
    if (isLoading) {
      NProgress.start();
    } else {
      NProgress.done();
    }

    return () => {
      NProgress.done();
    };
  }, [isLoading]);

  return null;
};
