import { Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import AddEnrollmentButton from './AddEnrollmentButton';

interface EmptyEnrollmentsProps {
  canManageEnrollments: boolean;
  onAddClick: () => void;
}

function EmptyEnrollments({ canManageEnrollments, onAddClick }: EmptyEnrollmentsProps) {
  const { t } = useTranslation();

  return (
    <>
      {canManageEnrollments ? <AddEnrollmentButton onClick={onAddClick} /> : null}
      <Empty description={t('enrollments.empty.description')} />
    </>
  );
}

export default EmptyEnrollments;
