import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { addNewCourse, deleteCourse, getAllCourses, updateCourse } from '../client';
import { notifyHttpError } from '../apiError';
import { successNotification } from '../Notification';
import { courseKeys } from '../courseKeys';
import type { Course, NewCourse } from '../types/course';

export function useCourses() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    data: courses = [],
    isPending,
    isError,
    isFetching,
    refetch,
  } = useQuery<Course[]>({
    queryKey: courseKeys.all,
    queryFn: getAllCourses,
  });

  const { mutateAsync: createCourseMutation } = useMutation({
    mutationFn: (course: NewCourse) => addNewCourse(course),
    onSuccess: async (_result, course) => {
      successNotification(
        t('courses.notifications.addedTitle'),
        t('courses.notifications.addedDescription', { title: course.title })
      );
      await queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });

  const { mutateAsync: updateCourseMutation } = useMutation({
    mutationFn: ({ courseId, course }: { courseId: number; course: NewCourse }) =>
      updateCourse(courseId, course),
    onSuccess: async (_result, { course }) => {
      successNotification(
        t('courses.notifications.updatedTitle'),
        t('courses.notifications.updatedDescription', { title: course.title })
      );
      await queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });

  const { mutateAsync: deleteCourseMutation } = useMutation({
    mutationFn: (courseId: number) => deleteCourse(courseId),
    onSuccess: async (_result, courseId) => {
      successNotification(
        t('courses.notifications.deletedTitle'),
        t('courses.notifications.deletedDescription', { id: courseId })
      );
      await queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });

  const createCourse = useCallback(
    async (course: NewCourse): Promise<boolean> => {
      try {
        await createCourseMutation(course);
        return true;
      } catch (err: unknown) {
        await notifyHttpError(err, { placement: 'bottomLeft' });
        return false;
      }
    },
    [createCourseMutation]
  );

  const updateCourseById = useCallback(
    async (courseId: number, course: NewCourse): Promise<boolean> => {
      try {
        await updateCourseMutation({ courseId, course });
        return true;
      } catch (err: unknown) {
        await notifyHttpError(err, { placement: 'bottomLeft' });
        return false;
      }
    },
    [updateCourseMutation]
  );

  const removeCourseById = useCallback(
    async (courseId: number) => {
      try {
        await deleteCourseMutation(courseId);
      } catch (err: unknown) {
        await notifyHttpError(err);
      }
    },
    [deleteCourseMutation]
  );

  const retryLoad = () => {
    void refetch();
  };

  return {
    courses,
    /** True only while there is no cached data yet (initial load). */
    isLoading: isPending,
    isError,
    isFetching,
    retryLoad,
    createCourse,
    updateCourseById,
    removeCourseById,
  };
}
