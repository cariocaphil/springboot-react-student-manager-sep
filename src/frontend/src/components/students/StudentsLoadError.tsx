import { Button, Empty, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

interface StudentsLoadErrorProps {
  onRetry: () => void;
  retrying?: boolean;
}

function StudentsLoadError({ onRetry, retrying = false }: StudentsLoadErrorProps) {
  const { t } = useTranslation();

  return (
    <Empty
      description={
        <Space direction="vertical" size="small">
          <Typography.Text strong>{t('students.loadError.title')}</Typography.Text>
          <Typography.Text type="secondary">{t('students.loadError.description')}</Typography.Text>
        </Space>
      }
    >
      <Button type="primary" onClick={onRetry} loading={retrying}>
        {t('students.loadError.retry')}
      </Button>
    </Empty>
  );
}

export default StudentsLoadError;
