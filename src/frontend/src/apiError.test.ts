import { beforeEach, describe, expect, it, vi } from 'vitest';
import { notifyHttpError, notifyUnexpectedError, toUserFacingApiErrorMessage } from './apiError';
import i18n from './i18n';
import * as notify from './Notification';
import type { ApiErrorBody, HttpError } from './types/api';

vi.mock('./Notification');

describe('apiError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('toUserFacingApiErrorMessage uses the API message without status codes', () => {
    const body: ApiErrorBody = {
      message: 'Email taken',
      status: 400,
      error: 'Bad Request',
    };

    expect(toUserFacingApiErrorMessage(body)).toBe('Email taken');
  });

  it('toUserFacingApiErrorMessage falls back when message is blank', () => {
    const body: ApiErrorBody = {
      message: '   ',
      status: 500,
      error: 'Internal Server Error',
    };

    expect(toUserFacingApiErrorMessage(body)).toBe(i18n.t('errors.unexpected'));
  });

  it('notifyUnexpectedError uses a generic user-facing message', () => {
    notifyUnexpectedError(new Error('boom'));
    expect(notify.errorNotification).toHaveBeenCalledWith(
      i18n.t('errors.issueTitle'),
      i18n.t('errors.unexpected')
    );
  });

  it('notifyHttpError falls back to notifyUnexpectedError for non-HTTP errors', async () => {
    await notifyHttpError(new Error('boom'));
    expect(notify.errorNotification).toHaveBeenCalledWith(
      i18n.t('errors.issueTitle'),
      i18n.t('errors.unexpected')
    );
  });

  it('notifyHttpError surfaces the API message with optional placement', async () => {
    const error = {
      response: {
        json: async () => ({
          message: 'Email taken',
          status: 400,
          error: 'Bad Request',
        }),
      },
    } as HttpError;

    await notifyHttpError(error, { placement: 'bottomLeft' });

    expect(notify.errorNotification).toHaveBeenCalledWith(
      i18n.t('errors.issueTitle'),
      'Email taken',
      'bottomLeft'
    );
  });

  it('notifyHttpError omits placement when unset', async () => {
    const error = {
      response: {
        json: async () => ({
          message: 'Unavailable',
          status: 503,
          error: 'Service Unavailable',
        }),
      },
    } as HttpError;

    await notifyHttpError(error);

    expect(notify.errorNotification).toHaveBeenCalledWith(
      i18n.t('errors.issueTitle'),
      'Unavailable'
    );
    expect(notify.errorNotification).toHaveBeenCalledTimes(1);
    expect(vi.mocked(notify.errorNotification).mock.calls[0]).toHaveLength(2);
  });
});
