import type { z } from 'zod';
import type { DefaultValues } from 'react-hook-form';
import i18n from '../../i18n';
import { EnrollmentRequest } from '../../types/generated/schemas';
import type { NewEnrollment } from '../../types/enrollment';
import type { FormIssue } from '../../validation/formIssue';

/** Contract constraints only (generated); messages come from `createEnrollmentFormErrorMap`. */
export const enrollmentFormSchema = EnrollmentRequest;

/** Localized messages for the resolver `error` option (pass `i18n.language`). */
export function createEnrollmentFormErrorMap(language: string) {
  const t = i18n.getFixedT(language);
  return (issue: FormIssue) => {
    const field = issue.path?.[0];
    // Only "missing / not a number" means required; e.g. a fractional id (expected 'int') keeps Zod's message.
    const isMissing = issue.code === 'invalid_type' && issue.expected === 'number';
    if (field === 'studentId' && isMissing) {
      return t('enrollments.validation.studentRequired');
    }
    if (field === 'courseId' && isMissing) {
      return t('enrollments.validation.courseRequired');
    }
    return undefined;
  };
}

export type EnrollmentFormValues = z.infer<typeof enrollmentFormSchema>;

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
