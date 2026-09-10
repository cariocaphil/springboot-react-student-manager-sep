import { z } from 'zod';
import type { DefaultValues } from 'react-hook-form';
import type { TFunction } from 'i18next';
import { GENDERS, type NewStudent } from '../../types/student';
import { EMAIL_PATTERN } from '../../validation/email';

export function createStudentFormSchema(t: TFunction) {
  return z.object({
    name: z.string().min(1, t('students.validation.nameRequired')),
    email: z
      .string()
      .min(1, t('students.validation.emailRequired'))
      .regex(EMAIL_PATTERN, t('students.validation.emailInvalid')),
    gender: z.enum(GENDERS, {
      message: t('students.validation.genderRequired'),
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
