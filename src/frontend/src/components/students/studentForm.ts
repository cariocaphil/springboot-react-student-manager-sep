import { z } from 'zod';
import type { DefaultValues } from 'react-hook-form';
import i18n from '../../i18n';
import { StudentRequest } from '../../types/generated/schemas';
import type { NewStudent, Student } from '../../types/student';
import { withParseErrorMap } from '../../validation/withParseErrorMap';

/** Build schema with messages for the given language (pass `i18n.language` so callers rebuild on change). */
export function createStudentFormSchema(language: string = i18n.language) {
  const t = i18n.getFixedT(language);
  return withParseErrorMap(StudentRequest, (issue) => {
    const field = issue.path?.[0];
    if (field === 'name' && issue.code === 'too_small') {
      return t('students.validation.nameRequired');
    }
    if (field === 'email' && (issue.code === 'too_small' || issue.code === 'invalid_type')) {
      return t('students.validation.emailRequired');
    }
    if (field === 'email' && issue.code === 'invalid_format') {
      // z.email() rejects '' with invalid_format (often before too_small); keep required UX for empty.
      if (issue.input === '') {
        return t('students.validation.emailRequired');
      }
      return t('students.validation.emailInvalid');
    }
    if (field === 'gender') {
      return t('students.validation.genderRequired');
    }
    return undefined;
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

export function studentToFormValues(student: Student): StudentFormValues {
  return {
    name: student.name,
    email: student.email,
    gender: student.gender,
  };
}
