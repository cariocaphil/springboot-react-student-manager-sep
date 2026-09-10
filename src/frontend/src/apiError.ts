import { errorNotification } from './Notification';
import i18n from './i18n';
import type { ApiErrorBody } from './types/api';
import { isHttpError } from './types/api';
import type { NotificationPlacement } from './types/notification';

/** User-facing description from the API body — message only, no status codes. */
export function toUserFacingApiErrorMessage(body: ApiErrorBody): string {
  const message = body.message?.trim();
  return message || i18n.t('errors.unexpected');
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
