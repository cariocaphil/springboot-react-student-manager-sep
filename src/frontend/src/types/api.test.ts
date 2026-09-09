import { describe, expect, it } from 'vitest';
import { isHttpError } from './api';

describe('api types', () => {
  it('isHttpError accepts errors with a response', () => {
    expect(isHttpError({ response: { ok: false } })).toBe(true);
    expect(isHttpError(new Error('boom'))).toBe(false);
    expect(isHttpError(null)).toBe(false);
  });
});
