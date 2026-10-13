import { Button } from 'antd';
import { useTranslation } from 'react-i18next';

interface CourseDrawerFooterProps {
  onClose: () => void;
}

function CourseDrawerFooter({ onClose }: CourseDrawerFooterProps) {
  const { t } = useTranslation();

  return (
    <div
      style={{
        textAlign: 'right',
      }}
    >
      <Button onClick={onClose} style={{ marginRight: 8 }}>
        {t('courses.drawer.cancel')}
      </Button>
    </div>
  );
}

export default CourseDrawerFooter;
