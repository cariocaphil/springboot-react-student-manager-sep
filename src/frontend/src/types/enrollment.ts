import type { components } from './generated/schema';

type Schemas = components['schemas'];

/**
 * Wire DTO for an enrollment returned by the API (`EnrollmentResponse`).
 */
export type Enrollment = Schemas['EnrollmentResponse'];

/**
 * Wire DTO for create-enrollment requests (`EnrollmentRequest`).
 */
export type NewEnrollment = Schemas['EnrollmentRequest'];
