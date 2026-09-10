# OpenAPI contract

Committed OpenAPI 3 document exported from the Spring Boot app (springdoc).

| Rule | Detail |
| --- | --- |
| Source of truth | Spring Boot API DTOs + controller annotations |
| This file | Deterministic snapshot used by frontend type generation |
| Do not edit by hand | Re-export instead (see README / `OpenApiContractTest`) |
| Frontend codegen | `cd src/frontend && npm run generate:api-types` → `src/types/generated/schema.d.ts` |
