import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  formatApiErrorDescription,
  notifyHttpError,
  notifyUnexpectedError,
} from './apiError';
import * as notify from './Notification';
import type { ApiErrorBody, HttpError } from './types/api';

vi.mock('./Notification');

describe('apiError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('formatApiErrorDescription preserves compact and spaced layouts', () => {
    const body: ApiErrorBody = {
      message: 'Unavailable',
      status: 503,
      error: 'Service Unavailable',
    };

    expect(formatApiErrorDescription(body, 'compact')).toBe(
      'Unavailable[503] [Service Unavailable]'
    );
    expect(formatApiErrorDescription(body, 'spaced')).toBe(
      'Unavailable [503] [Service Unavailable]'
    );
  });

  it('notifyUnexpectedError uses Error.message', () => {
    notifyUnexpectedError(new Error('boom'));
    expect(notify.errorNotification).toHaveBeenCalledWith(
      'There was an issue',
      'boom'
    );
  });

  it('notifyUnexpectedError falls back for non-Error values', () => {
    notifyUnexpectedError('nope', { placement: 'bottomLeft' });
    expect(notify.errorNotification).toHaveBeenCalledWith(
      'There was an issue',
      'Unexpected error',
      'bottomLeft'
    );
  });

  it('notifyHttpError falls back to notifyUnexpectedError for non-HTTP errors', async () => {
    await notifyHttpError(new Error('boom'));
    expect(notify.errorNotification).toHaveBeenCalledWith(
      'There was an issue',
      'boom'
    );
  });

  it('notifyHttpError surfaces API body with optional placement', async () => {
    const error = {
      response: {
        json: async () => ({
          message: 'Email taken',
          status: 400,
          error: 'Bad Request',
        }),
      },
    } as HttpError;

    await notifyHttpError(error, {
      descriptionStyle: 'spaced',
      placement: 'bottomLeft',
    });

    expect(notify.errorNotification).toHaveBeenCalledWith(
      'There was an issue',
      'Email taken [400] [Bad Request]',
      'bottomLeft'
    );
  });

  it('notifyHttpError omits placement when unset (list-error shape)', async () => {
    const error = {
      response: {
        json: async () => ({
          message: 'Unavailable',
          status: 503,
          error: 'Service Unavailable',
        }),
      },
    } as HttpError;

    await notifyHttpError(error, { descriptionStyle: 'compact' });

    expect(notify.errorNotification).toHaveBeenCalledWith(
      'There was an issue',
      'Unavailable[503] [Service Unavailable]'
    );
    expect(notify.errorNotification).toHaveBeenCalledTimes(1);
    expect(vi.mocked(notify.errorNotification).mock.calls[0]).toHaveLength(2);
  });
});
