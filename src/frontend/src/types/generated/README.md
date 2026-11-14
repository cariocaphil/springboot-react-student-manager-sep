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

No running backend is required for frontend generation — only an up-to-date
`api/openapi.json` and `npm install`.
