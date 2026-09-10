import type { components } from './generated/schema';

type Schemas = components['schemas'];

/**
 * Wire DTO for a student returned by the API (`StudentResponse`).
 * Prefer this for list/table data that mirrors the HTTP contract.
 */
export type Student = Schemas['StudentResponse'];

/**
 * Wire DTO for create-student requests (`StudentRequest`).
 */
export type NewStudent = Schemas['StudentRequest'];

/**
 * Gender values from the OpenAPI contract (used by Zod / select options).
 * Keep in sync with `StudentRequest.gender` — covered by Vitest.
 */
export const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const satisfies ReadonlyArray<
  NewStudent['gender']
>;

export type Gender = (typeof GENDERS)[number];
