import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  deleteEnrollment,
  enrollStudent,
  getAllCourses,
  getAllEnrollments,
  getAllStudents,
} from '../client';
import { notifyHttpError } from '../apiError';
import { joinEnrollmentRows } from '../components/enrollments/joinEnrollmentRows';
import { courseKeys } from '../courseKeys';
import { enrollmentKeys } from '../enrollmentKeys';
import { successNotification } from '../Notification';
import { studentKeys } from '../studentKeys';
import type { Course } from '../types/course';
import type { Enrollment, NewEnrollment } from '../types/enrollment';
import type { Student } from '../types/student';

function hasNoCachedData<T>(isPending: boolean, data: T | undefined): boolean {
  return isPending && data === undefined;
}

export function useEnrollments() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const enrollmentsQuery = useQuery<Enrollment[]>({
    queryKey: enrollmentKeys.all,
    queryFn: getAllEnrollments,
  });

  const studentsQuery = useQuery<Student[]>({
    queryKey: studentKeys.all,
    queryFn: getAllStudents,
  });

  const coursesQuery = useQuery<Course[]>({
    queryKey: courseKeys.all,
    queryFn: getAllCourses,
  });

  const enrollments = enrollmentsQuery.data ?? [];
  const students = studentsQuery.data ?? [];
  const courses = coursesQuery.data ?? [];

  const isLoading =
    hasNoCachedData(enrollmentsQuery.isPending, enrollmentsQuery.data) ||
    hasNoCachedData(studentsQuery.isPending, studentsQuery.data) ||
    hasNoCachedData(coursesQuery.isPending, coursesQuery.data);

  const isError = enrollmentsQuery.isError || studentsQuery.isError || coursesQuery.isError;

  const lookupsReady = studentsQuery.isSuccess && coursesQuery.isSuccess;
  const enrollmentsReady = enrollmentsQuery.isSuccess;

  const rows =
    lookupsReady && enrollmentsReady ? joinEnrollmentRows(enrollments, students, courses) : [];

  const isFetching =
    enrollmentsQuery.isFetching || studentsQuery.isFetching || coursesQuery.isFetching;

  const { mutateAsync: createEnrollmentMutation } = useMutation({
    mutationFn: (enrollment: NewEnrollment) => enrollStudent(enrollment),
    onSuccess: async () => {
      successNotification(
        t('enrollments.notifications.addedTitle'),
        t('enrollments.notifications.addedDescription')
      );
      await queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
    },
  });

  const { mutateAsync: deleteEnrollmentMutation } = useMutation({
    mutationFn: (enrollmentId: number) => deleteEnrollment(enrollmentId),
    onSuccess: async (_result, enrollmentId) => {
      successNotification(
        t('enrollments.notifications.cancelledTitle'),
        t('enrollments.notifications.cancelledDescription', { id: enrollmentId })
      );
      await queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
    },
  });

  const createEnrollment = useCallback(
    async (enrollment: NewEnrollment): Promise<boolean> => {
      try {
        await createEnrollmentMutation(enrollment);
        return true;
      } catch (err: unknown) {
        await notifyHttpError(err, { placement: 'bottomLeft' });
        return false;
      }
    },
    [createEnrollmentMutation]
  );

  const removeEnrollmentById = useCallback(
    async (enrollmentId: number) => {
      try {
        await deleteEnrollmentMutation(enrollmentId);
      } catch (err: unknown) {
        await notifyHttpError(err);
      }
    },
    [deleteEnrollmentMutation]
  );

  const retryLoad = () => {
    void enrollmentsQuery.refetch();
    void studentsQuery.refetch();
    void coursesQuery.refetch();
  };

  return {
    enrollments,
    students,
    courses,
    rows,
    /** True while any required query has no cached data yet. */
    isLoading,
    isError,
    isFetching,
    /** True when student and course lookups succeeded (join/form safe). */
    lookupsReady,
    retryLoad,
    createEnrollment,
    removeEnrollmentById,
  };
}
