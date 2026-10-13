import type { components } from './generated/schema';

type Schemas = components['schemas'];

/**
 * Wire DTO for a course returned by the API (`CourseResponse`).
 */
export type Course = Schemas['CourseResponse'];

/**
 * Wire DTO for create/update course requests (`CourseRequest`).
 */
export type NewCourse = Schemas['CourseRequest'];
