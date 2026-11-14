import { z } from 'zod';
import type { DefaultValues } from 'react-hook-form';
import i18n from '../../i18n';
import { CourseRequest } from '../../types/generated/schemas';
import type { Course, NewCourse } from '../../types/course';
import type { FormIssue } from '../../validation/formIssue';

/** Generated capacity constraints; title is trimmed and description is always a string in the form. */
export const courseFormSchema = CourseRequest.safeExtend({
  title: z.string().trim().min(1),
  description: z.string(),
});

/** Localized messages for the resolver `error` option (pass `i18n.language`). */
export function createCourseFormErrorMap(language: string) {
  const t = i18n.getFixedT(language);
  return (issue: FormIssue) => {
    const field = issue.path?.[0];
    if (field === 'title' && issue.code === 'too_small') {
      return t('courses.validation.titleRequired');
    }
    if (field === 'capacity') {
      if (issue.code === 'too_small') {
        return t('courses.validation.capacityMin');
      }
      if (issue.code === 'invalid_type' && issue.expected === 'int') {
        return t('courses.validation.capacityInteger');
      }
      if (issue.code === 'invalid_type') {
        return t('courses.validation.capacityRequired');
      }
    }
    return undefined;
  };
}

export type CourseFormValues = z.infer<typeof courseFormSchema>;

export const defaultValues: DefaultValues<CourseFormValues> = {
  title: '',
  description: '',
  capacity: undefined,
};

/** Explicit form → domain boundary after Zod validation. */
export function createNewCourseFromForm(values: CourseFormValues): NewCourse {
  const description = values.description.trim();
  return {
    title: values.title.trim(),
    capacity: values.capacity,
    ...(description === '' ? {} : { description }),
  };
}

export function courseToFormValues(course: Course): CourseFormValues {
  return {
    title: course.title,
    description: course.description ?? '',
    capacity: course.capacity,
  };
}
