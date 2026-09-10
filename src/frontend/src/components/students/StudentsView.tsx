import { useState } from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import StudentDrawerForm from './StudentDrawerForm';
import { useStudents } from '../../hooks/useStudents';
import EmptyStudents from './EmptyStudents';
import StudentsTable from './StudentsTable';

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

function StudentsView() {
  const { students, fetching, createStudent, removeStudentById } = useStudents();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  let body;
  if (fetching) {
    body = <Spin indicator={antIcon} />;
  } else if (students.length <= 0) {
    body = <EmptyStudents onAddClick={openDrawer} />;
  } else {
    body = (
      <StudentsTable students={students} onDelete={removeStudentById} onAddClick={openDrawer} />
    );
  }

  return (
    <>
      <StudentDrawerForm open={drawerOpen} onClose={closeDrawer} onCreate={createStudent} />
      {body}
    </>
  );
}

export default StudentsView;
