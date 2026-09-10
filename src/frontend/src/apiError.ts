import { errorNotification } from './Notification';
import type { ApiErrorBody } from './types/api';
import { isHttpError } from './types/api';
import type { NotificationPlacement } from './types/notification';

/** Preserve historical list vs delete/add description spacing. */
export type ApiErrorDescriptionStyle = 'compact' | 'spaced';

export function formatApiErrorDescription(
  body: ApiErrorBody,
  style: ApiErrorDescriptionStyle = 'spaced'
): string {
  if (style === 'compact') {
    return `${body.message}[${body.status}] [${body.error}]`;
  }
  return `${body.message} [${body.status}] [${body.error}]`;
}

function notifyIssue(description: string, placement?: NotificationPlacement): void {
  if (placement !== undefined) {
    errorNotification('There was an issue', description, placement);
    return;
  }
  errorNotification('There was an issue', description);
}

/** Map an unknown failure to a user-facing error toast. */
export function notifyUnexpectedError(
  error: unknown,
  options: { placement?: NotificationPlacement } = {}
): void {
  const description = error instanceof Error ? error.message : 'Unexpected error';
  notifyIssue(description, options.placement);
}

export async function notifyHttpError(
  error: unknown,
  options: {
    descriptionStyle?: ApiErrorDescriptionStyle;
    placement?: NotificationPlacement;
  } = {}
): Promise<void> {
  if (!isHttpError(error)) {
    notifyUnexpectedError(error, { placement: options.placement });
    return;
  }

  const body = await error.response.json<ApiErrorBody>();
  const description = formatApiErrorDescription(body, options.descriptionStyle ?? 'spaced');
  notifyIssue(description, options.placement);
}
