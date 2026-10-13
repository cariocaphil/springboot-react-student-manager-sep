import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import CourseActions from './CourseActions';
import type { Course } from '../../types/course';

type UseCourseColumnsOptions = {
  canManageCourses: boolean;
  onDelete: (courseId: number) => void;
  onEdit: (course: Course) => void;
};

export function useCourseColumns({
  canManageCourses,
  onDelete,
  onEdit,
}: UseCourseColumnsOptions): ColumnsType<Course> {
  const { t } = useTranslation();

  const columns: ColumnsType<Course> = [
    {
      title: t('courses.columns.id'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('courses.columns.title'),
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: t('courses.columns.description'),
      dataIndex: 'description',
      key: 'description',
      render: (description: string | undefined) => description ?? '—',
    },
    {
      title: t('courses.columns.capacity'),
      dataIndex: 'capacity',
      key: 'capacity',
    },
  ];

  if (canManageCourses) {
    columns.push({
      title: t('courses.columns.actions'),
      key: 'actions',
      render: (_text, course) => (
        <CourseActions course={course} onDelete={onDelete} onEdit={onEdit} />
      ),
    });
  }

  return columns;
}
