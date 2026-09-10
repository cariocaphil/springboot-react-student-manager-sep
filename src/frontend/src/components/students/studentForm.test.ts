import { describe, expect, it } from 'vitest';
import { createNewStudentFromForm } from './studentForm';

describe('createNewStudentFromForm', () => {
  it('returns a NewStudent when gender is set', () => {
    expect(
      createNewStudentFromForm({
        name: 'Ada',
        email: 'ada@example.com',
        gender: 'FEMALE',
      })
    ).toEqual({
      name: 'Ada',
      email: 'ada@example.com',
      gender: 'FEMALE',
    });
  });

  it('returns undefined when gender is missing', () => {
    expect(
      createNewStudentFromForm({
        name: 'Ada',
        email: 'ada@example.com',
        gender: undefined,
      })
    ).toBeUndefined();
  });
});
