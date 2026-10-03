import { Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import AddStudentButton from './AddStudentButton';

interface EmptyStudentsProps {
  canManageStudents: boolean;
  onAddClick: () => void;
}

function EmptyStudents({ canManageStudents, onAddClick }: EmptyStudentsProps) {
  const { t } = useTranslation();

  return (
    <>
      {canManageStudents ? <AddStudentButton onClick={onAddClick} /> : null}
      <Empty description={t('students.empty.description')} />
    </>
  );
}

export default EmptyStudents;
