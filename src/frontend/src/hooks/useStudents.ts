import { useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { addNewStudent, deleteStudent, getAllStudents } from '../client';
import { notifyHttpError } from '../apiError';
import { successNotification } from '../Notification';
import { studentKeys } from '../studentKeys';
import type { NewStudent, Student } from '../types/student';

export function useStudents() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    data: students = [],
    isLoading: fetching,
    isError,
    error,
  } = useQuery<Student[]>({
    queryKey: studentKeys.all,
    queryFn: getAllStudents,
  });

  useEffect(() => {
    if (isError && error) {
      void notifyHttpError(error, { descriptionStyle: 'compact' });
    }
  }, [isError, error]);

  const { mutateAsync: createStudentMutation } = useMutation({
    mutationFn: (student: NewStudent) => addNewStudent(student),
    onSuccess: async (_result, student) => {
      successNotification(
        t('students.notifications.addedTitle'),
        t('students.notifications.addedDescription', { name: student.name })
      );
      await queryClient.invalidateQueries({ queryKey: studentKeys.all });
    },
  });

  const { mutateAsync: deleteStudentMutation } = useMutation({
    mutationFn: (studentId: number) => deleteStudent(studentId),
    onSuccess: async (_result, studentId) => {
      successNotification(
        t('students.notifications.deletedTitle'),
        t('students.notifications.deletedDescription', { id: studentId })
      );
      await queryClient.invalidateQueries({ queryKey: studentKeys.all });
    },
  });

  const createStudent = useCallback(
    async (student: NewStudent): Promise<boolean> => {
      try {
        await createStudentMutation(student);
        return true;
      } catch (err: unknown) {
        await notifyHttpError(err, {
          descriptionStyle: 'spaced',
          placement: 'bottomLeft',
        });
        return false;
      }
    },
    [createStudentMutation]
  );

  const removeStudentById = useCallback(
    async (studentId: number) => {
      try {
        await deleteStudentMutation(studentId);
      } catch (err: unknown) {
        await notifyHttpError(err, { descriptionStyle: 'spaced' });
      }
    },
    [deleteStudentMutation]
  );

  return {
    students,
    fetching,
    createStudent,
    removeStudentById,
  };
}
