import { z } from 'zod';
import type { DefaultValues } from 'react-hook-form';
import i18n from '../../i18n';
import { CourseRequest } from '../../types/generated/schemas';
import type { Course, NewCourse } from '../../types/course';
import { withParseErrorMap } from '../../validation/withParseErrorMap';

/** Build schema with messages for the given language (pass `i18n.language` so callers rebuild on change). */
export function createCourseFormSchema(language: string = i18n.language) {
  const t = i18n.getFixedT(language);
  // Keep generated capacity constraints; override title (trim) and description (always string in the form).
  const base = CourseRequest.safeExtend({
    title: z.string().trim().min(1),
    description: z.string(),
  });
  return withParseErrorMap(base, (issue) => {
    const field = issue.path?.[0];
    if (field === 'title' && issue.code === 'too_small') {
      return t('courses.validation.titleRequired');
    }
    if (field === 'capacity') {
      if (issue.code === 'too_small') {
        return t('courses.validation.capacityMin');
      }
      if (issue.code === 'invalid_type') {
        const expected = 'expected' in issue ? issue.expected : undefined;
        if (expected === 'int') {
          return t('courses.validation.capacityInteger');
        }
        return t('courses.validation.capacityRequired');
      }
    }
    return undefined;
  });
}

export type CourseFormValues = z.infer<ReturnType<typeof createCourseFormSchema>>;

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
