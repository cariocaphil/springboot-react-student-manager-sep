import { Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import AddCourseButton from './AddCourseButton';

interface EmptyCoursesProps {
  canManageCourses: boolean;
  onAddClick: () => void;
}

function EmptyCourses({ canManageCourses, onAddClick }: EmptyCoursesProps) {
  const { t } = useTranslation();

  return (
    <>
      {canManageCourses ? <AddCourseButton onClick={onAddClick} /> : null}
      <Empty description={t('courses.empty.description')} />
    </>
  );
}

export default EmptyCourses;
