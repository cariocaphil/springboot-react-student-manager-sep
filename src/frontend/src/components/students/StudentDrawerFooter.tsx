import { Button } from 'antd';
import { useTranslation } from 'react-i18next';

interface StudentDrawerFooterProps {
  onClose: () => void;
}

function StudentDrawerFooter({ onClose }: StudentDrawerFooterProps) {
  const { t } = useTranslation();

  return (
    <div
      style={{
        textAlign: 'right',
      }}
    >
      <Button onClick={onClose} style={{ marginRight: 8 }}>
        {t('students.drawer.cancel')}
      </Button>
    </div>
  );
}

export default StudentDrawerFooter;
