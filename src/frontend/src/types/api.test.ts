import { describe, expect, it } from 'vitest';
import type { components } from './generated/schema';
import { isHttpError } from './api';
import type { ApiErrorBody } from './api';

describe('api types', () => {
  it('isHttpError accepts errors with a response', () => {
    expect(isHttpError({ response: { ok: false } })).toBe(true);
    expect(isHttpError(new Error('boom'))).toBe(false);
    expect(isHttpError(null)).toBe(false);
  });

  it('ApiErrorBody matches the generated ApiErrorResponse schema', () => {
    const body: ApiErrorBody = {
      message: 'Email taken',
      status: 400,
      error: 'Bad Request',
    };
    const fromSchema: components['schemas']['ApiErrorResponse'] = body;
    expect(fromSchema.message).toBe('Email taken');
  });
});
