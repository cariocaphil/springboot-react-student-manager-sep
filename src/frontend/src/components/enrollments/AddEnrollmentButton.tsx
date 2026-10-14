import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface AddEnrollmentButtonProps {
  onClick: () => void;
}

function AddEnrollmentButton({ onClick }: AddEnrollmentButtonProps) {
  const { t } = useTranslation();

  return (
    <Button onClick={onClick} type="primary" shape="round" icon={<PlusOutlined />} size="small">
      {t('enrollments.addNew')}
    </Button>
  );
}

export default AddEnrollmentButton;
