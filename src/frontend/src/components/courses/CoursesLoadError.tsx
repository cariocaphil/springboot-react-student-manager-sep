import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import ErrorState from '../ErrorState';

interface CoursesLoadErrorProps {
  onRetry: () => void;
  retrying?: boolean;
}

function CoursesLoadError({ onRetry, retrying = false }: CoursesLoadErrorProps) {
  const { t } = useTranslation();

  return (
    <ErrorState
      title={t('courses.loadError.title')}
      description={t('courses.loadError.description')}
      action={
        <Button type="primary" onClick={onRetry} loading={retrying}>
          {t('courses.loadError.retry')}
        </Button>
      }
    />
  );
}

export default CoursesLoadError;
