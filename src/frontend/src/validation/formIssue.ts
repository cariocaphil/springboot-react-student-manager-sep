/** Issue shape passed to Zod 4 `error` callbacks (`path` may be unset). */
export type FormIssue = {
  readonly code: string;
  readonly path?: PropertyKey[];
  readonly expected?: unknown;
  readonly input?: unknown;
};
