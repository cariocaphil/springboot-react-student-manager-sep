import type { ColumnsType } from 'antd/es/table';
import StudentActions from './StudentActions';
import StudentAvatar from './StudentAvatar';
import type { Student } from '../../types/student';

export function buildColumns(
  onDelete: (studentId: number) => void,
): ColumnsType<Student> {
  return [
    {
      title: '',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (_text, student) => <StudentAvatar name={student.name} />,
    },
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_text, student) => (
        <StudentActions
          studentName={student.name}
          studentId={student.id}
          onDelete={onDelete}
        />
      ),
    },
  ];
}
