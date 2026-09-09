import { useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import {
  Badge,
  Button,
  Empty,
  Popconfirm,
  Radio,
  Spin,
  Table,
  Tag,
} from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import StudentDrawerForm from '../StudentDrawerForm';
import StudentAvatar from './StudentAvatar';
import { useStudents } from '../hooks/useStudents';
import type { Student } from '../types';

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

function AddStudentButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      type="primary"
      shape="round"
      icon={<PlusOutlined />}
      size="small"
    >
      Add New Student
    </Button>
  );
}

function buildColumns(onDelete: (studentId: number) => void): ColumnsType<Student> {
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

function StudentsView() {
  const { students, fetching, refreshStudents, removeStudentById } = useStudents();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  let body;
  if (fetching) {
    body = <Spin indicator={antIcon} />;
  } else if (students.length <= 0) {
    body = (
      <>
        <AddStudentButton onClick={openDrawer} />
        <Empty />
      </>
    );
  } else {
    body = (
      <Table
        dataSource={students}
        columns={buildColumns(removeStudentById)}
        bordered
        title={() => (
          <>
            <Tag>Number of students</Tag>
            <Badge count={students.length} className="site-badge-count-4" />
            <br />
            <br />
            <AddStudentButton onClick={openDrawer} />
          </>
        )}
        pagination={{ pageSize: 50 }}
        scroll={{ y: 240 }}
        rowKey={(student) => student.id}
      />
    );
  }

  return (
    <>
      <StudentDrawerForm
        open={drawerOpen}
        onClose={closeDrawer}
        onCreated={refreshStudents}
      />
      {body}
    </>
  );
}

export default StudentsView;
