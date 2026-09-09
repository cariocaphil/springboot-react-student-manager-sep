import { useCallback, useEffect, useState } from 'react';
import { addNewStudent, deleteStudent, getAllStudents } from '../client';
import { notifyHttpError } from '../apiError';
import { successNotification } from '../Notification';
import type { NewStudent, Student } from '../types';

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [fetching, setFetching] = useState(true);

  const refreshStudents = useCallback(async () => {
    try {
      const data = await getAllStudents();
      setStudents(data);
    } catch (err: unknown) {
      await notifyHttpError(err, { descriptionStyle: 'compact' });
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    void refreshStudents();
  }, [refreshStudents]);

  const createStudent = useCallback(
    async (student: NewStudent): Promise<boolean> => {
      try {
        await addNewStudent(student);
        successNotification(
          'Student successfully added',
          `${student.name} was added to the system`
        );
        await refreshStudents();
        return true;
      } catch (err: unknown) {
        await notifyHttpError(err, {
          descriptionStyle: 'spaced',
          placement: 'bottomLeft',
        });
        return false;
      }
    },
    [refreshStudents]
  );

  const removeStudentById = useCallback(
    async (studentId: number) => {
      try {
        await deleteStudent(studentId);
        successNotification('Student deleted', `Student with ${studentId} was deleted`);
        await refreshStudents();
      } catch (err: unknown) {
        await notifyHttpError(err, { descriptionStyle: 'spaced' });
      }
    },
    [refreshStudents]
  );

  return {
    students,
    fetching,
    createStudent,
    removeStudentById,
  };
}
