import { FC } from 'react';
import { first } from 'lodash';

import { useAppSelector, useAppDispatch } from '@hooks';
import { NotificationsActions, NotificationsSelectors } from '@store';
import { Banner } from '@components/common';

export const NotificationBanner: FC = () => {
  const latestMessage = first(useAppSelector(NotificationsSelectors.selectActiveMessages));
  const dispatch = useAppDispatch();

  const dismissMessagebyId = () => {
    if (latestMessage) {
      dispatch(NotificationsActions.dismissMessage(latestMessage.id));
    }
  };

  return <Banner notification={latestMessage} onClose={dismissMessagebyId} />;
};
