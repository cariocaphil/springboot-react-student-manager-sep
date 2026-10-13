import { useState } from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useAuth } from '../../auth/AuthContext';
import CourseDrawerForm from './CourseDrawerForm';
import { useCourses } from '../../hooks/useCourses';
import type { Course, NewCourse } from '../../types/course';
import EmptyCourses from './EmptyCourses';
import CoursesLoadError from './CoursesLoadError';
import CoursesTable from './CoursesTable';

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

function CoursesView() {
  const { canManageStudents } = useAuth();
  const canManageCourses = canManageStudents;
  const {
    courses,
    isLoading,
    isError,
    isFetching,
    retryLoad,
    createCourse,
    updateCourseById,
    removeCourseById,
  } = useCourses();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const openCreateDrawer = () => {
    setEditingCourse(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (course: Course) => {
    setEditingCourse(course);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingCourse(null);
  };

  const saveCourse = async (course: NewCourse): Promise<boolean> => {
    if (editingCourse !== null) {
      return updateCourseById(editingCourse.id, course);
    }
    return createCourse(course);
  };

  let body;
  if (isLoading) {
    body = <Spin indicator={antIcon} />;
  } else if (isError) {
    body = <CoursesLoadError onRetry={retryLoad} retrying={isFetching} />;
  } else if (courses.length <= 0) {
    body = <EmptyCourses canManageCourses={canManageCourses} onAddClick={openCreateDrawer} />;
  } else {
    body = (
      <CoursesTable
        courses={courses}
        canManageCourses={canManageCourses}
        onDelete={removeCourseById}
        onEdit={openEditDrawer}
        onAddClick={openCreateDrawer}
      />
    );
  }

  return (
    <>
      {canManageCourses ? (
        <CourseDrawerForm
          open={drawerOpen}
          editingCourse={editingCourse}
          onClose={closeDrawer}
          onSave={saveCourse}
        />
      ) : null}
      {body}
    </>
  );
}

export default CoursesView;
