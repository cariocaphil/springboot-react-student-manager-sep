import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface AddCourseButtonProps {
  onClick: () => void;
}

function AddCourseButton({ onClick }: AddCourseButtonProps) {
  const { t } = useTranslation();

  return (
    <Button onClick={onClick} type="primary" shape="round" icon={<PlusOutlined />} size="small">
      {t('courses.addNew')}
    </Button>
  );
}

export default AddCourseButton;
