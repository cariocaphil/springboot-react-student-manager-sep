import { describe, expect, it } from 'vitest';
import { createNewStudentFromForm, studentFormSchema } from './studentForm';

function failures(input: unknown) {
  const result = studentFormSchema.safeParse(input);
  expect(result.success).toBe(false);
  return result.success ? [] : result.error.issues.map((i) => `${String(i.path[0])}:${i.code}`);
}

describe('studentFormSchema (constraints)', () => {
  it('accepts a complete valid student', () => {
    const result = studentFormSchema.safeParse({
      name: 'Ada',
      email: 'ada@example.com',
      gender: 'FEMALE',
    });
    expect(result.success).toBe(true);
  });

  it('requires name, email, and gender', () => {
    const found = failures({ name: '', email: '', gender: undefined });
    expect(found).toEqual(
      expect.arrayContaining(['name:too_small', 'email:too_small', 'gender:invalid_value'])
    );
  });

  it('rejects a missing email as invalid_type', () => {
    expect(failures({ name: 'Ada', gender: 'FEMALE' })).toContain('email:invalid_type');
  });

  it('rejects an invalid email format', () => {
    expect(failures({ name: 'Ada', email: 'not-an-email', gender: 'FEMALE' })).toEqual([
      'email:invalid_format',
    ]);
  });
});

describe('createNewStudentFromForm', () => {
  it('maps validated form values to NewStudent', () => {
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
});
