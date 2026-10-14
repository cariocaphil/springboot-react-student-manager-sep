import { Button } from 'antd';
import { useTranslation } from 'react-i18next';

interface EnrollmentDrawerFooterProps {
  onClose: () => void;
}

function EnrollmentDrawerFooter({ onClose }: EnrollmentDrawerFooterProps) {
  const { t } = useTranslation();

  return (
    <div
      style={{
        textAlign: 'right',
      }}
    >
      <Button onClick={onClose} style={{ marginRight: 8 }}>
        {t('enrollments.drawer.cancel')}
      </Button>
    </div>
  );
}

export default EnrollmentDrawerFooter;
