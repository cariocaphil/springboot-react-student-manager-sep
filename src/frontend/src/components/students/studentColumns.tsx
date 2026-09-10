import type { ColumnsType } from 'antd/es/table';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import StudentActions from './StudentActions';
import StudentAvatar from './StudentAvatar';
import type { Student } from '../../types/student';

export function useStudentColumns(onDelete: (studentId: number) => void): ColumnsType<Student> {
  const { t } = useTranslation();

  return useMemo(
    () => [
      {
        title: '',
        dataIndex: 'avatar',
        key: 'avatar',
        render: (_text, student) => <StudentAvatar name={student.name} />,
      },
      {
        title: t('students.columns.id'),
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: t('students.columns.name'),
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: t('students.columns.email'),
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: t('students.columns.gender'),
        dataIndex: 'gender',
        key: 'gender',
      },
      {
        title: t('students.columns.actions'),
        key: 'actions',
        render: (_text, student) => (
          <StudentActions studentName={student.name} studentId={student.id} onDelete={onDelete} />
        ),
      },
    ],
    [onDelete, t]
  );
}
