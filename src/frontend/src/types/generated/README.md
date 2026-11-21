# Generated API artifacts — do not edit by hand.

From `src/frontend`:

| Script | Output | Tool |
| --- | --- | --- |
| `npm run generate:api-types` | `schema.d.ts` | `openapi-typescript` |
| `npm run generate:zod` | `schemas.ts` | `typed-openapi` (Zod v4, schemas-only) |
| `npm run check:api-types` | — | fails if `schema.d.ts` is stale |
| `npm run check:zod` | — | fails if `schemas.ts` is stale |

Both generators read the committed OpenAPI document at `../../api/openapi.json`
(export from Spring Boot via `OpenApiContractTest` / `-Dopenapi.export=true`).
They are independent artifacts from the same spec; `schemas.test.ts`
assignability and runtime `safeParse` checks guard against Zod ↔ domain-type
drift. A follow-up could infer TypeScript types from Zod and drop
`openapi-typescript`.

No running backend is required for frontend generation — only an up-to-date
`api/openapi.json` and `npm install`.

## Compile-time vs runtime

- **`schema.d.ts`** — TypeScript wire types only (erased at runtime).
- **`schemas.ts`** — Zod schemas used at runtime:
  - Forms import `*Request` (plus small overlays).
  - `client.ts` validates successful JSON via `parseApiResponse` and
    `StudentResponse` / `CourseResponse` / `EnrollmentResponse` /
    `CurrentUserResponse` (collections with `z.array(...)`).
  - Void success paths (HTTP 201/204 create/update/delete) do **not** parse
    JSON bodies.
  - `ApiErrorResponse` is generated but not yet used to parse HTTP error bodies.

When the OpenAPI contract changes: refresh `api/openapi.json`, then run
`npm run generate:api-types` and `npm run generate:zod` (CI/`check:*` will fail
if committed artifacts lag).
