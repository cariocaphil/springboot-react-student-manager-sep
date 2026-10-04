import { Popconfirm, Radio } from 'antd';
import { useTranslation } from 'react-i18next';
import type { Student } from '../../types/student';

interface StudentActionsProps {
  student: Student;
  onDelete: (studentId: number) => void;
  onEdit: (student: Student) => void;
}

function StudentActions({ student, onDelete, onEdit }: StudentActionsProps) {
  const { t } = useTranslation();

  return (
    <Radio.Group>
      <Popconfirm
        placement="topRight"
        title={t('students.actions.deleteConfirm', { name: student.name })}
        onConfirm={() => {
          void onDelete(student.id);
        }}
        okText={t('students.actions.yes')}
        cancelText={t('students.actions.no')}
      >
        <Radio.Button value="small">{t('students.actions.delete')}</Radio.Button>
      </Popconfirm>
      <Radio.Button
        value="edit"
        onClick={() => {
          onEdit(student);
        }}
      >
        {t('students.actions.edit')}
      </Radio.Button>
    </Radio.Group>
  );
}

export default StudentActions;
