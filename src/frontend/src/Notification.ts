import { notification } from 'antd';
import type { ArgsProps } from 'antd/es/notification';

type NotificationType = 'success' | 'error' | 'info' | 'warning';
type Placement = ArgsProps['placement'];

const openNotificationWithIcon = (
  type: NotificationType,
  message: string,
  description: string,
  placement: Placement = 'topRight'
): void => {
  notification[type]({ message, description, placement });
};

export const successNotification = (
  message: string,
  description: string,
  placement?: Placement
): void => openNotificationWithIcon('success', message, description, placement);

export const errorNotification = (
  message: string,
  description: string,
  placement?: Placement
): void => openNotificationWithIcon('error', message, description, placement);

export const infoNotification = (
  message: string,
  description: string,
  placement?: Placement
): void => openNotificationWithIcon('info', message, description, placement);

export const warningNotification = (
  message: string,
  description: string,
  placement?: Placement
): void => openNotificationWithIcon('warning', message, description, placement);
