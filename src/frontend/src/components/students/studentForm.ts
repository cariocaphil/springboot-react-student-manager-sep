import { z } from 'zod';
import type { DefaultValues } from 'react-hook-form';
import { GENDERS, type NewStudent } from '../../types/student';
import { EMAIL_INVALID_MESSAGE, EMAIL_PATTERN } from '../../validation/email';

export const studentFormSchema = z.object({
  name: z.string().min(1, 'Please enter student name'),
  email: z
    .string()
    .min(1, 'Please enter student email')
    .regex(EMAIL_PATTERN, EMAIL_INVALID_MESSAGE),
  gender: z.enum(GENDERS, {
    message: 'Please select a gender',
  }),
});

/** Validated form values derived from the Zod schema. */
export type StudentFormValues = z.infer<typeof studentFormSchema>;

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
