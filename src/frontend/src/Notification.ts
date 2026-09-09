import { notification } from 'antd';
import type { NotificationPlacement, NotificationType } from './types/notification';

const openNotificationWithIcon = (
  type: NotificationType,
  message: string,
  description: string,
  placement: NotificationPlacement = 'topRight'
): void => {
  notification[type]({ message, description, placement });
};

export const successNotification = (
  message: string,
  description: string,
  placement?: NotificationPlacement
): void => openNotificationWithIcon('success', message, description, placement);

export const errorNotification = (
  message: string,
  description: string,
  placement?: NotificationPlacement
): void => openNotificationWithIcon('error', message, description, placement);

export const infoNotification = (
  message: string,
  description: string,
  placement?: NotificationPlacement
): void => openNotificationWithIcon('info', message, description, placement);

export const warningNotification = (
  message: string,
  description: string,
  placement?: NotificationPlacement
): void => openNotificationWithIcon('warning', message, description, placement);
