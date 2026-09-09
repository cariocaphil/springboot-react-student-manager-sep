import { beforeEach, describe, expect, it, vi } from 'vitest';
import { notification } from 'antd';
import {
  errorNotification,
  infoNotification,
  successNotification,
  warningNotification,
} from './Notification';

vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd');
  return {
    ...actual,
    notification: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
    },
  };
});

describe('Notification helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successNotification defaults placement to topRight', () => {
    successNotification('Saved', 'Student created');
    expect(notification.success).toHaveBeenCalledWith({
      message: 'Saved',
      description: 'Student created',
      placement: 'topRight',
    });
  });

  it('errorNotification honors custom placement', () => {
    errorNotification('Failed', 'Bad request', 'bottomLeft');
    expect(notification.error).toHaveBeenCalledWith({
      message: 'Failed',
      description: 'Bad request',
      placement: 'bottomLeft',
    });
  });

  it('infoNotification and warningNotification delegate to antd', () => {
    infoNotification('Heads up', 'FYI');
    warningNotification('Careful', 'Check email');

    expect(notification.info).toHaveBeenCalledWith({
      message: 'Heads up',
      description: 'FYI',
      placement: 'topRight',
    });
    expect(notification.warning).toHaveBeenCalledWith({
      message: 'Careful',
      description: 'Check email',
      placement: 'topRight',
    });
  });
});
