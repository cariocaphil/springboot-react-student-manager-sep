import { describe, expect, it } from 'vitest';
import { EMAIL_INVALID_MESSAGE } from '../../validation/email';
import {
  createNewStudentFromForm,
  studentFormSchema,
} from './studentForm';

describe('studentFormSchema', () => {
  it('accepts a complete valid student', () => {
    const result = studentFormSchema.safeParse({
      name: 'Ada',
      email: 'ada@example.com',
      gender: 'FEMALE',
    });
    expect(result.success).toBe(true);
  });

  it('requires name, email, and gender', () => {
    const result = studentFormSchema.safeParse({
      name: '',
      email: '',
      gender: undefined,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain('Please enter student name');
      expect(messages).toContain('Please enter student email');
      expect(messages).toContain('Please select a gender');
    }
  });

  it('rejects an invalid email', () => {
    const result = studentFormSchema.safeParse({
      name: 'Ada',
      email: 'not-an-email',
      gender: 'FEMALE',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        EMAIL_INVALID_MESSAGE
      );
    }
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
