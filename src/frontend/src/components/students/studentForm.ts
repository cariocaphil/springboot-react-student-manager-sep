import type { z } from 'zod';
import type { DefaultValues } from 'react-hook-form';
import i18n from '../../i18n';
import { StudentRequest } from '../../types/generated/schemas';
import type { NewStudent, Student } from '../../types/student';
import type { FormIssue } from '../../validation/formIssue';

/** Contract constraints only (generated); messages come from `createStudentFormErrorMap`. */
export const studentFormSchema = StudentRequest;

/** Localized messages for the resolver `error` option (pass `i18n.language`). */
export function createStudentFormErrorMap(language: string) {
  const t = i18n.getFixedT(language);
  return (issue: FormIssue) => {
    const field = issue.path?.[0];
    if (field === 'name' && issue.code === 'too_small') {
      return t('students.validation.nameRequired');
    }
    if (field === 'email') {
      if (issue.code === 'too_small' || issue.code === 'invalid_type') {
        return t('students.validation.emailRequired');
      }
      if (issue.code === 'invalid_format') {
        // z.email() reports '' as invalid_format (before too_small); keep "required" for empty.
        return issue.input === ''
          ? t('students.validation.emailRequired')
          : t('students.validation.emailInvalid');
      }
    }
    // Zod enum failures are always invalid_value (missing / wrong / null), not invalid_type.
    if (field === 'gender' && issue.code === 'invalid_value') {
      return t('students.validation.genderRequired');
    }
    return undefined;
  };
}

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

export function studentToFormValues(student: Student): StudentFormValues {
  return {
    name: student.name,
    email: student.email,
    gender: student.gender,
  };
}
