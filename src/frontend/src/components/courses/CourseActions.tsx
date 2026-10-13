import { Popconfirm, Radio } from 'antd';
import { useTranslation } from 'react-i18next';
import type { Course } from '../../types/course';

interface CourseActionsProps {
  course: Course;
  onDelete: (courseId: number) => void;
  onEdit: (course: Course) => void;
}

function CourseActions({ course, onDelete, onEdit }: CourseActionsProps) {
  const { t } = useTranslation();

  return (
    <Radio.Group>
      <Popconfirm
        placement="topRight"
        title={t('courses.actions.deleteConfirm', { title: course.title })}
        onConfirm={() => {
          void onDelete(course.id);
        }}
        okText={t('courses.actions.yes')}
        cancelText={t('courses.actions.no')}
      >
        <Radio.Button value="small">{t('courses.actions.delete')}</Radio.Button>
      </Popconfirm>
      <Radio.Button
        value="edit"
        onClick={() => {
          onEdit(course);
        }}
      >
        {t('courses.actions.edit')}
      </Radio.Button>
    </Radio.Group>
  );
}

export default CourseActions;
