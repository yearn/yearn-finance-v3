import { useEffect } from 'react';
import NProgress from 'nprogress';

NProgress.configure({ trickleSpeed: 100 });

interface PageProgressBarProps {
  isLoading?: boolean;
  loadingProgress?: number;
}

export const PageProgressBar = ({ isLoading, loadingProgress }: PageProgressBarProps) => {
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

  useEffect(() => {
    if (isLoading && loadingProgress && NProgress.status && loadingProgress > NProgress.status) {
      NProgress.set(loadingProgress);
    }
  }, [loadingProgress]);

  return null;
};
