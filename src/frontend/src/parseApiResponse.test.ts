import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import {
  ApiResponseValidationError,
  isApiResponseValidationError,
  parseApiResponse,
} from './parseApiResponse';
import { StudentResponse } from './types/generated/schemas';

describe('parseApiResponse', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

  beforeEach(() => {
    consoleError.mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns parsed data for a valid payload', () => {
    const student = {
      id: 1,
      name: 'Ada',
      email: 'ada@example.com',
      gender: 'FEMALE' as const,
    };

    expect(parseApiResponse(StudentResponse, student)).toEqual(student);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('throws ApiResponseValidationError with readonly issues on failure', () => {
    expect(() => parseApiResponse(StudentResponse, { id: 1 })).toThrow(ApiResponseValidationError);

    try {
      parseApiResponse(StudentResponse, { id: 1 });
    } catch (error: unknown) {
      expect(isApiResponseValidationError(error)).toBe(true);
      if (isApiResponseValidationError(error)) {
        expect(error.issues.length).toBeGreaterThan(0);
        expect(Object.isFrozen(error.issues) || Array.isArray(error.issues)).toBe(true);
        const paths = error.issues.map((issue) => issue.path[0]);
        expect(paths).toEqual(expect.arrayContaining(['name', 'email', 'gender']));
      }
    }
  });

  it('logs only path and code in development', () => {
    vi.stubEnv('DEV', true);

    expect(() => parseApiResponse(z.array(StudentResponse), [{ id: 'x' }])).toThrow(
      ApiResponseValidationError
    );

    expect(consoleError).toHaveBeenCalledTimes(1);
    const [, diagnostics] = consoleError.mock.calls[0] ?? [];
    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: expect.any(Array),
          code: expect.any(String),
        }),
      ])
    );
    for (const entry of diagnostics as Array<Record<string, unknown>>) {
      expect(entry).not.toHaveProperty('message');
      expect(Object.keys(entry).sort()).toEqual(['code', 'path']);
    }
  });

  it('does not log in production', () => {
    vi.stubEnv('DEV', false);

    expect(() => parseApiResponse(StudentResponse, {})).toThrow(ApiResponseValidationError);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
