import type { ArgsProps } from 'antd/es/notification';
import { errorNotification } from './Notification';
import type { ApiErrorBody } from './types';
import { isHttpError } from './types';

type Placement = ArgsProps['placement'];

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

export async function notifyHttpError(
  error: unknown,
  options: {
    descriptionStyle?: ApiErrorDescriptionStyle;
    placement?: Placement;
  } = {}
): Promise<void> {
  if (!isHttpError(error)) {
    return;
  }

  const body = await error.response.json<ApiErrorBody>();
  const description = formatApiErrorDescription(
    body,
    options.descriptionStyle ?? 'spaced'
  );

  if (options.placement !== undefined) {
    errorNotification('There was an issue', description, options.placement);
    return;
  }

  errorNotification('There was an issue', description);
}
