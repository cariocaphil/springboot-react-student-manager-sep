import { useState } from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useAuth } from '../../auth/AuthContext';
import StudentDrawerForm from './StudentDrawerForm';
import { useStudents } from '../../hooks/useStudents';
import type { NewStudent, Student } from '../../types/student';
import EmptyStudents from './EmptyStudents';
import StudentsLoadError from './StudentsLoadError';
import StudentsTable from './StudentsTable';

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

function StudentsView() {
  const { canManageStudents } = useAuth();
  const {
    students,
    isLoading,
    isError,
    isFetching,
    retryLoad,
    createStudent,
    updateStudentById,
    removeStudentById,
  } = useStudents();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const openCreateDrawer = () => {
    if (!canManageStudents) {
      return;
    }
    setEditingStudent(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (student: Student) => {
    if (!canManageStudents) {
      return;
    }
    setEditingStudent(student);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingStudent(null);
  };

  const saveStudent = async (student: NewStudent): Promise<boolean> => {
    if (editingStudent !== null) {
      return updateStudentById(editingStudent.id, student);
    }
    return createStudent(student);
  };

  let body;
  if (isLoading) {
    body = <Spin indicator={antIcon} />;
  } else if (isError) {
    body = <StudentsLoadError onRetry={retryLoad} retrying={isFetching} />;
  } else if (students.length <= 0) {
    body = <EmptyStudents canManageStudents={canManageStudents} onAddClick={openCreateDrawer} />;
  } else {
    body = (
      <StudentsTable
        students={students}
        canManageStudents={canManageStudents}
        onDelete={removeStudentById}
        onEdit={openEditDrawer}
        onAddClick={openCreateDrawer}
      />
    );
  }

  return (
    <>
      {canManageStudents ? (
        <StudentDrawerForm
          open={drawerOpen}
          editingStudent={editingStudent}
          onClose={closeDrawer}
          onSave={saveStudent}
        />
      ) : null}
      {body}
    </>
  );
}

export default StudentsView;
