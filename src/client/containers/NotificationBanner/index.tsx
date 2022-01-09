import { FC } from 'react';

import { useAppSelector } from '@hooks';
import { NotificationsSelectors } from '@store';
import { Banner, Markdown } from '@src/client/components/common';

export const NotificationBanner: FC = () => {
  //   const latestMessage = useAppSelector(NotificationsSelectors.selectActiveMessages)[0];
  //   const { message, id, type } = latestMessage;
  const firstMessage = useAppSelector(NotificationsSelectors.selectMessages)[0];
  return (
    <Banner>
      <Markdown>{firstMessage.message}</Markdown>
    </Banner>
  );
};
