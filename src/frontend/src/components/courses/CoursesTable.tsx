import { Badge, Table, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import type { Course } from '../../types/course';
import AddCourseButton from './AddCourseButton';
import { useCourseColumns } from './courseColumns';

interface CoursesTableProps {
  courses: Course[];
  canManageCourses: boolean;
  onDelete: (courseId: number) => void;
  onEdit: (course: Course) => void;
  onAddClick: () => void;
}

function CoursesTable({
  courses,
  canManageCourses,
  onDelete,
  onEdit,
  onAddClick,
}: CoursesTableProps) {
  const { t } = useTranslation();
  const columns = useCourseColumns({ canManageCourses, onDelete, onEdit });

  return (
    <Table
      dataSource={courses}
      columns={columns}
      bordered
      title={() => (
        <>
          <Tag>{t('courses.countTag')}</Tag>
          <Badge count={courses.length} className="site-badge-count-4" />
          {canManageCourses ? (
            <>
              <br />
              <br />
              <AddCourseButton onClick={onAddClick} />
            </>
          ) : null}
        </>
      )}
      pagination={{ pageSize: 50 }}
      scroll={{ y: 240 }}
      rowKey={(course) => course.id}
    />
  );
}

export default CoursesTable;
