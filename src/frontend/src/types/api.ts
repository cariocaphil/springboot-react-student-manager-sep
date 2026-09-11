import type { components } from './generated/schema';

/** Minimal response shape returned by `unfetch` (transport concern, not OpenAPI). */
export type ApiResponse = {
  ok: boolean;
  status: number;
  statusText: string;
  json: <T = unknown>() => Promise<T>;
};

/** Structured API error body from OpenAPI `ApiErrorResponse`. */
export type ApiErrorBody = components['schemas']['ApiErrorResponse'];

/** Stable error code from OpenAPI (`ApiErrorResponse.code`). */
export type ApiErrorCode = ApiErrorBody['code'];

export type HttpError = Error & { response: ApiResponse };

export function isHttpError(error: unknown): error is HttpError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    (error as HttpError).response != null
  );
}
