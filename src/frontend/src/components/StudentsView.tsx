import { useState } from 'react';
import {
  Badge,
  Button,
  Empty,
  Spin,
  Table,
  Tag,
} from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import StudentDrawerForm from '../StudentDrawerForm';
import { useStudents } from '../hooks/useStudents';
import { buildColumns } from './studentColumns';

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
