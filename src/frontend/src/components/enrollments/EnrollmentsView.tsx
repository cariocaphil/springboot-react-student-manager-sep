import { useState } from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useAuth } from '../../auth/AuthContext';
import { useEnrollments } from '../../hooks/useEnrollments';
import type { NewEnrollment } from '../../types/enrollment';
import EmptyEnrollments from './EmptyEnrollments';
import EnrollmentDrawerForm from './EnrollmentDrawerForm';
import EnrollmentsLoadError from './EnrollmentsLoadError';
import EnrollmentsTable from './EnrollmentsTable';

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

function EnrollmentsView() {
  const { canManageStudents } = useAuth();
  const canManageEnrollments = canManageStudents;
  const {
    enrollments,
    students,
    courses,
    rows,
    isLoading,
    isError,
    isFetching,
    lookupsReady,
    retryLoad,
    createEnrollment,
    removeEnrollmentById,
  } = useEnrollments();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openCreateDrawer = () => {
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const saveEnrollment = async (enrollment: NewEnrollment): Promise<boolean> => {
    return createEnrollment(enrollment);
  };

  let body;
  if (isLoading) {
    body = <Spin indicator={antIcon} />;
  } else if (isError) {
    body = <EnrollmentsLoadError onRetry={retryLoad} retrying={isFetching} />;
  } else if (rows.length <= 0) {
    body = (
      <EmptyEnrollments canManageEnrollments={canManageEnrollments} onAddClick={openCreateDrawer} />
    );
  } else {
    body = (
      <EnrollmentsTable
        rows={rows}
        canManageEnrollments={canManageEnrollments}
        onCancel={removeEnrollmentById}
        onAddClick={openCreateDrawer}
      />
    );
  }

  return (
    <>
      {canManageEnrollments && lookupsReady ? (
        <EnrollmentDrawerForm
          open={drawerOpen}
          students={students}
          courses={courses}
          enrollments={enrollments}
          onClose={closeDrawer}
          onSave={saveEnrollment}
        />
      ) : null}
      {body}
    </>
  );
}

export default EnrollmentsView;
