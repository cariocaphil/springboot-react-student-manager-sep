import { z } from 'zod';
import type { DefaultValues } from 'react-hook-form';
import i18n from '../../i18n';
import type { NewEnrollment } from '../../types/enrollment';

/** Build schema with messages for the given language (pass `i18n.language` so callers rebuild on change). */
export function createEnrollmentFormSchema(language: string = i18n.language) {
  const t = i18n.getFixedT(language);
  return z.object({
    studentId: z.number({ message: t('enrollments.validation.studentRequired') }),
    courseId: z.number({ message: t('enrollments.validation.courseRequired') }),
  });
}

export type EnrollmentFormValues = z.infer<ReturnType<typeof createEnrollmentFormSchema>>;

export const defaultValues: DefaultValues<EnrollmentFormValues> = {
  studentId: undefined,
  courseId: undefined,
};

export function createNewEnrollmentFromForm(values: EnrollmentFormValues): NewEnrollment {
  return {
    studentId: values.studentId,
    courseId: values.courseId,
  };
}
