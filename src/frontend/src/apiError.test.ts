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

  it('toUserFacingApiErrorMessage maps known codes to i18n (not the diagnostic message)', () => {
    const body: ApiErrorBody = {
      code: 'EMAIL_TAKEN',
      message: 'Email ada@example.com taken',
      status: 400,
      error: 'Bad Request',
    };

    expect(toUserFacingApiErrorMessage(body)).toBe(i18n.t('errors.codes.emailTaken'));
    expect(toUserFacingApiErrorMessage(body)).not.toBe(body.message);
  });

  it('toUserFacingApiErrorMessage maps COURSE_NOT_FOUND to i18n', () => {
    const body: ApiErrorBody = {
      code: 'COURSE_NOT_FOUND',
      message: 'Course with id 99 was not found',
      status: 404,
      error: 'Not Found',
    };

    expect(toUserFacingApiErrorMessage(body)).toBe(i18n.t('errors.codes.courseNotFound'));
  });

  it('toUserFacingApiErrorMessage maps enrollment error codes to i18n', () => {
    expect(
      toUserFacingApiErrorMessage({
        code: 'DUPLICATE_ENROLLMENT',
        message: 'Student 1 already enrolled in course 2',
        status: 400,
        error: 'Bad Request',
      })
    ).toBe(i18n.t('errors.codes.duplicateEnrollment'));

    expect(
      toUserFacingApiErrorMessage({
        code: 'COURSE_FULL',
        message: 'Course 10 is full',
        status: 400,
        error: 'Bad Request',
      })
    ).toBe(i18n.t('errors.codes.courseFull'));

    expect(
      toUserFacingApiErrorMessage({
        code: 'ENROLLMENT_NOT_FOUND',
        message: 'Enrollment with id 99 does not exist',
        status: 404,
        error: 'Not Found',
      })
    ).toBe(i18n.t('errors.codes.enrollmentNotFound'));
  });

  it('toUserFacingApiErrorMessage falls back for unknown codes', () => {
    const body = {
      code: 'SOME_FUTURE_CODE',
      message: 'Server detail',
      status: 500,
      error: 'Internal Server Error',
    } as unknown as ApiErrorBody;

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

  it('notifyHttpError surfaces the i18n message for a known code with optional placement', async () => {
    const error = {
      response: {
        json: async () =>
          ({
            code: 'EMAIL_TAKEN',
            message: 'Email taken',
            status: 400,
            error: 'Bad Request',
          }) satisfies ApiErrorBody,
      },
    } as HttpError;

    await notifyHttpError(error, { placement: 'bottomLeft' });

    expect(notify.errorNotification).toHaveBeenCalledWith(
      i18n.t('errors.issueTitle'),
      i18n.t('errors.codes.emailTaken'),
      'bottomLeft'
    );
  });

  it('notifyHttpError falls back to unexpected for unknown codes', async () => {
    const error = {
      response: {
        json: async () => ({
          code: 'SOME_FUTURE_CODE',
          message: 'Unavailable',
          status: 503,
          error: 'Service Unavailable',
        }),
      },
    } as HttpError;

    await notifyHttpError(error);

    expect(notify.errorNotification).toHaveBeenCalledWith(
      i18n.t('errors.issueTitle'),
      i18n.t('errors.unexpected')
    );
    expect(notify.errorNotification).toHaveBeenCalledTimes(1);
    expect(vi.mocked(notify.errorNotification).mock.calls[0]).toHaveLength(2);
  });
});
