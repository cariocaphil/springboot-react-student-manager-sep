import { Popconfirm, Radio } from 'antd';
import { useTranslation } from 'react-i18next';

interface StudentActionsProps {
  studentName: string;
  studentId: number;
  onDelete: (studentId: number) => void;
}

function StudentActions({ studentName, studentId, onDelete }: StudentActionsProps) {
  const { t } = useTranslation();

  return (
    <Radio.Group>
      <Popconfirm
        placement="topRight"
        title={t('students.actions.deleteConfirm', { name: studentName })}
        onConfirm={() => {
          void onDelete(studentId);
        }}
        okText={t('students.actions.yes')}
        cancelText={t('students.actions.no')}
      >
        <Radio.Button value="small">{t('students.actions.delete')}</Radio.Button>
      </Popconfirm>
      <Radio.Button value="small">{t('students.actions.edit')}</Radio.Button>
    </Radio.Group>
  );
}

export default StudentActions;
