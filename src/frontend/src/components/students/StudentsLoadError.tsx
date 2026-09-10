import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import ErrorState from '../ErrorState';

interface StudentsLoadErrorProps {
  onRetry: () => void;
  retrying?: boolean;
}

function StudentsLoadError({ onRetry, retrying = false }: StudentsLoadErrorProps) {
  const { t } = useTranslation();

  return (
    <ErrorState
      title={t('students.loadError.title')}
      description={t('students.loadError.description')}
      action={
        <Button type="primary" onClick={onRetry} loading={retrying}>
          {t('students.loadError.retry')}
        </Button>
      }
    />
  );
}

export default StudentsLoadError;
