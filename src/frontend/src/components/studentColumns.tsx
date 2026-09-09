import type { ColumnsType } from 'antd/es/table';
import { Popconfirm, Radio } from 'antd';
import StudentAvatar from './StudentAvatar';
import type { Student } from '../types';

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
        <Radio.Group>
          <Popconfirm
            placement="topRight"
            title={`Are you sure to delete ${student.name}`}
            onConfirm={() => {
              void onDelete(student.id);
            }}
            okText="Yes"
            cancelText="No"
          >
            <Radio.Button value="small">Delete</Radio.Button>
          </Popconfirm>
          <Radio.Button value="small">Edit</Radio.Button>
        </Radio.Group>
      ),
    },
  ];
}
