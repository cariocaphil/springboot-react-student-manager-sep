import { z } from 'zod';
import type { DefaultValues } from 'react-hook-form';
import i18n from '../../i18n';
import type { Course, NewCourse } from '../../types/course';

/** Build schema with messages for the active i18n language (pass `i18n.language` so callers rebuild on change). */
export function createCourseFormSchema(language: string = i18n.language) {
  void language;
  return z.object({
    title: z.string().trim().min(1, i18n.t('courses.validation.titleRequired')),
    description: z.string(),
    capacity: z
      .number({ message: i18n.t('courses.validation.capacityRequired') })
      .int({ message: i18n.t('courses.validation.capacityInteger') })
      .min(1, i18n.t('courses.validation.capacityMin')),
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
