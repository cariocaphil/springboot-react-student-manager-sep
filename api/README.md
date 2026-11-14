# OpenAPI contract

Committed OpenAPI 3 document exported from the Spring Boot app (springdoc).

| Rule | Detail |
| --- | --- |
| Source of truth | Spring Boot API DTOs + controller annotations |
| This file | Deterministic snapshot used by frontend type + Zod generation |
| Do not edit by hand | Re-export instead (see README / `OpenApiContractTest`) |
| Frontend codegen | `cd src/frontend && npm run generate:api-types` → `schema.d.ts`; `npm run generate:zod` → `schemas.ts` |
