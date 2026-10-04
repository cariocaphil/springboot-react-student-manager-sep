import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import StudentActions from './StudentActions';
import StudentAvatar from './StudentAvatar';
import type { Student } from '../../types/student';

type UseStudentColumnsOptions = {
  canManageStudents: boolean;
  onDelete: (studentId: number) => void;
  onEdit: (student: Student) => void;
};

export function useStudentColumns({
  canManageStudents,
  onDelete,
  onEdit,
}: UseStudentColumnsOptions): ColumnsType<Student> {
  const { t } = useTranslation();

  const columns: ColumnsType<Student> = [
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
  ];

  if (canManageStudents) {
    columns.push({
      title: t('students.columns.actions'),
      key: 'actions',
      render: (_text, student) => (
        <StudentActions student={student} onDelete={onDelete} onEdit={onEdit} />
      ),
    });
  }

  return columns;
}
