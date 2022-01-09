import { FC } from 'react';

import { useAppSelector, useAppDispatch } from '@hooks';
import { NotificationsActions, NotificationsSelectors } from '@store';
import { Banner, Markdown, Button } from '@src/client/components/common';
import { first } from 'lodash';

export const NotificationBanner: FC = () => {
  const latestMessage = first(useAppSelector(NotificationsSelectors.selectActiveMessages));
  const dispatch = useAppDispatch();
  return (
    <>
      {latestMessage && (
        <Banner>
          <Markdown>{latestMessage.message}</Markdown>
          <Button onClick={() => dispatch(NotificationsActions.dismissMessage(latestMessage.id))}>Dismiss</Button>
        </Banner>
      )}
    </>
  );
};
