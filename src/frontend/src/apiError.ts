import { errorNotification } from './Notification';
import i18n from './i18n';
import type { ApiErrorBody, ApiErrorCode } from './types/api';
import { isHttpError } from './types/api';
import type { NotificationPlacement } from './types/notification';

/** i18n keys for OpenAPI `ApiErrorCode` values — keep in sync with the generated union. */
const ERROR_CODE_MESSAGE_KEYS = {
  EMAIL_TAKEN: 'errors.codes.emailTaken',
  STUDENT_NOT_FOUND: 'errors.codes.studentNotFound',
  VALIDATION_FAILED: 'errors.codes.validationFailed',
  BAD_REQUEST: 'errors.codes.badRequest',
} as const satisfies Record<ApiErrorCode, string>;

function isKnownApiErrorCode(code: string): code is ApiErrorCode {
  return Object.prototype.hasOwnProperty.call(ERROR_CODE_MESSAGE_KEYS, code);
}

/**
 * User-facing description from the API body.
 * Known codes map to i18n; unknown/missing codes fall back to the generic message.
 * `body.message` remains available for diagnostics but is not primary UI copy for known codes.
 */
export function toUserFacingApiErrorMessage(body: ApiErrorBody): string {
  if (isKnownApiErrorCode(body.code)) {
    return i18n.t(ERROR_CODE_MESSAGE_KEYS[body.code]);
  }
  return i18n.t('errors.unexpected');
}

function notifyIssue(description: string, placement?: NotificationPlacement): void {
  const title = i18n.t('errors.issueTitle');
  if (placement !== undefined) {
    errorNotification(title, description, placement);
    return;
  }
  errorNotification(title, description);
}

/** Map an unknown failure to a user-facing error toast (no raw technical details). */
export function notifyUnexpectedError(
  error: unknown,
  options: { placement?: NotificationPlacement } = {}
): void {
  void error;
  notifyIssue(i18n.t('errors.unexpected'), options.placement);
}

export async function notifyHttpError(
  error: unknown,
  options: { placement?: NotificationPlacement } = {}
): Promise<void> {
  if (!isHttpError(error)) {
    notifyUnexpectedError(error, { placement: options.placement });
    return;
  }

  const body = await error.response.json<ApiErrorBody>();
  notifyIssue(toUserFacingApiErrorMessage(body), options.placement);
}
