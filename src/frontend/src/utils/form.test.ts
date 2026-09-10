import { describe, expect, it } from 'vitest';
import { validationStatus } from './form';

describe('validationStatus', () => {
  it('returns error when the field has an error', () => {
    expect(validationStatus(true)).toBe('error');
  });

  it('returns undefined when the field has no error', () => {
    expect(validationStatus(false)).toBeUndefined();
  });
});
