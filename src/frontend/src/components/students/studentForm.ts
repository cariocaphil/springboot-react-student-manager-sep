import { z } from 'zod';
import type { DefaultValues } from 'react-hook-form';
import i18n from '../../i18n';
import { GENDERS, type NewStudent } from '../../types/student';
import { EMAIL_PATTERN } from '../../validation/email';

/** Build schema with messages for the active i18n language (pass `i18n.language` so callers rebuild on change). */
export function createStudentFormSchema(language: string = i18n.language) {
  void language;
  return z.object({
    name: z.string().min(1, i18n.t('students.validation.nameRequired')),
    email: z
      .string()
      .min(1, i18n.t('students.validation.emailRequired'))
      .regex(EMAIL_PATTERN, i18n.t('students.validation.emailInvalid')),
    gender: z.enum(GENDERS, {
      message: i18n.t('students.validation.genderRequired'),
    }),
  });
}

export type StudentFormValues = z.infer<ReturnType<typeof createStudentFormSchema>>;

export const defaultValues: DefaultValues<StudentFormValues> = {
  name: '',
  email: '',
  gender: undefined,
};

/** Explicit form → domain boundary after Zod validation. */
export function createNewStudentFromForm(values: StudentFormValues): NewStudent {
  return {
    name: values.name,
    email: values.email,
    gender: values.gender,
  };
}
