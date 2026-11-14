import type { z } from 'zod';

/** Issue shape accepted by Zod 4 parse `error` callbacks (path may be unset). */
export type ParseErrorIssue = {
  readonly code: string;
  readonly path?: PropertyKey[];
  readonly expected?: unknown;
};

type ParseParams = {
  error?: (issue: ParseErrorIssue) => string | undefined | null | { message: string };
};

/**
 * Returns a schema that uses the same constraints as `schema`, but routes
 * `parse` / `safeParse` (and async variants) through a localized error map.
 * Does not mutate the original schema (important for generated exports).
 */
export function withParseErrorMap<T extends z.ZodType>(
  schema: T,
  localize: (issue: ParseErrorIssue) => string | undefined
): T {
  const mergeError = (issue: ParseErrorIssue, params?: ParseParams) => {
    const localized = localize(issue);
    if (localized != null) {
      return localized;
    }
    const parent = params?.error;
    return typeof parent === 'function' ? parent(issue) : undefined;
  };

  return Object.create(schema, {
    parse: {
      value(data: unknown, params?: ParseParams) {
        return schema.parse(data, {
          ...params,
          error: (issue) => mergeError(issue, params),
        });
      },
    },
    safeParse: {
      value(data: unknown, params?: ParseParams) {
        return schema.safeParse(data, {
          ...params,
          error: (issue) => mergeError(issue, params),
        });
      },
    },
    parseAsync: {
      value(data: unknown, params?: ParseParams) {
        return schema.parseAsync(data, {
          ...params,
          error: (issue) => mergeError(issue, params),
        });
      },
    },
    safeParseAsync: {
      value(data: unknown, params?: ParseParams) {
        return schema.safeParseAsync(data, {
          ...params,
          error: (issue) => mergeError(issue, params),
        });
      },
    },
  }) as T;
}
