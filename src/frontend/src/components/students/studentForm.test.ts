import { describe, expect, it } from 'vitest';
import i18n from '../../i18n';
import { createNewStudentFromForm, createStudentFormSchema } from './studentForm';

const studentFormSchema = createStudentFormSchema(i18n.t.bind(i18n));

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
      expect(messages).toContain(i18n.t('students.validation.nameRequired'));
      expect(messages).toContain(i18n.t('students.validation.emailRequired'));
      expect(messages).toContain(i18n.t('students.validation.genderRequired'));
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
        i18n.t('students.validation.emailInvalid')
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
