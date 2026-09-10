import { Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import AddStudentButton from './AddStudentButton';

interface EmptyStudentsProps {
  onAddClick: () => void;
}

function EmptyStudents({ onAddClick }: EmptyStudentsProps) {
  const { t } = useTranslation();

  return (
    <>
      <AddStudentButton onClick={onAddClick} />
      <Empty description={t('students.empty.description')} />
    </>
  );
}

export default EmptyStudents;
