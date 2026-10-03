import type { components } from './generated/schema';

/** Authenticated caller from OpenAPI `CurrentUserResponse`. */
export type CurrentUser = components['schemas']['CurrentUserResponse'];

export type UserRole = CurrentUser['role'];
