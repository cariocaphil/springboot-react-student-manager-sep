import { describe, expect, it } from 'vitest';
import { GENDERS } from './student';
import type { Gender } from './student';

describe('student types', () => {
  it('exposes gender options used by the create form', () => {
    expect(GENDERS).toEqual(['MALE', 'FEMALE', 'OTHER']);
    const sample: Gender = GENDERS[0];
    expect(sample).toBe('MALE');
  });
});
