import { z } from 'zod';
import type { DefaultValues } from 'react-hook-form';
import i18n from '../../i18n';
import { EnrollmentRequest } from '../../types/generated/schemas';
import type { NewEnrollment } from '../../types/enrollment';
import { withParseErrorMap } from '../../validation/withParseErrorMap';

/** Build schema with messages for the given language (pass `i18n.language` so callers rebuild on change). */
export function createEnrollmentFormSchema(language: string = i18n.language) {
  const t = i18n.getFixedT(language);
  // Generated EnrollmentRequest already matches the form shape; only localize messages.
  return withParseErrorMap(EnrollmentRequest, (issue) => {
    const field = issue.path?.[0];
    if (field === 'studentId') {
      return t('enrollments.validation.studentRequired');
    }
    if (field === 'courseId') {
      return t('enrollments.validation.courseRequired');
    }
    return undefined;
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
