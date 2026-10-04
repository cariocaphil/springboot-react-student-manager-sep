import { useState } from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useAuth } from '../../auth/AuthContext';
import StudentDrawerForm from './StudentDrawerForm';
import { useStudents } from '../../hooks/useStudents';
import EmptyStudents from './EmptyStudents';
import StudentsLoadError from './StudentsLoadError';
import StudentsTable from './StudentsTable';

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

function StudentsView() {
  const { canManageStudents } = useAuth();
  const { students, isLoading, isError, isFetching, retryLoad, createStudent, removeStudentById } =
    useStudents();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = () => {
    if (!canManageStudents) {
      return;
    }
    setDrawerOpen(true);
  };
  const closeDrawer = () => setDrawerOpen(false);

  let body;
  if (isLoading) {
    body = <Spin indicator={antIcon} />;
  } else if (isError) {
    body = <StudentsLoadError onRetry={retryLoad} retrying={isFetching} />;
  } else if (students.length <= 0) {
    body = <EmptyStudents canManageStudents={canManageStudents} onAddClick={openDrawer} />;
  } else {
    body = (
      <StudentsTable
        students={students}
        canManageStudents={canManageStudents}
        onDelete={removeStudentById}
        onAddClick={openDrawer}
      />
    );
  }

  return (
    <>
      {canManageStudents ? (
        <StudentDrawerForm open={drawerOpen} onClose={closeDrawer} onCreate={createStudent} />
      ) : null}
      {body}
    </>
  );
}

export default StudentsView;
