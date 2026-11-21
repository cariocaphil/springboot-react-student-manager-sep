import { z, type ZodIssue } from 'zod';

export class ApiResponseValidationError extends Error {
  readonly issues: ReadonlyArray<ZodIssue>;

  constructor(issues: ReadonlyArray<ZodIssue>) {
    super('API response failed schema validation');
    this.name = 'ApiResponseValidationError';
    this.issues = issues;
  }
}

export function isApiResponseValidationError(error: unknown): error is ApiResponseValidationError {
  return error instanceof ApiResponseValidationError;
}

function logValidationDiagnostics(issues: ReadonlyArray<ZodIssue>): void {
  if (!import.meta.env.DEV) {
    return;
  }
  const diagnostics = issues.map((issue) => ({
    path: issue.path,
    code: issue.code,
  }));
  console.error('API response validation failed', diagnostics);
}

/**
 * Validate a decoded JSON body against a generated Zod schema before it reaches
 * application consumers. Throws {@link ApiResponseValidationError} on failure.
 */
export function parseApiResponse<S extends z.ZodType>(schema: S, data: unknown): z.infer<S> {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  logValidationDiagnostics(result.error.issues);
  throw new ApiResponseValidationError(result.error.issues);
}
