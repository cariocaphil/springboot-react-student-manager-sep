import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import ErrorState from '../ErrorState';

interface EnrollmentsLoadErrorProps {
  onRetry: () => void;
  retrying?: boolean;
}

function EnrollmentsLoadError({ onRetry, retrying = false }: EnrollmentsLoadErrorProps) {
  const { t } = useTranslation();

  return (
    <ErrorState
      title={t('enrollments.loadError.title')}
      description={t('enrollments.loadError.description')}
      action={
        <Button type="primary" onClick={onRetry} loading={retrying}>
          {t('enrollments.loadError.retry')}
        </Button>
      }
    />
  );
}

export default EnrollmentsLoadError;
