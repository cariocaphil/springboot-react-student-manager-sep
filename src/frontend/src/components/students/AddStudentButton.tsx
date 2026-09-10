import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface AddStudentButtonProps {
  onClick: () => void;
}

function AddStudentButton({ onClick }: AddStudentButtonProps) {
  const { t } = useTranslation();

  return (
    <Button onClick={onClick} type="primary" shape="round" icon={<PlusOutlined />} size="small">
      {t('students.addNew')}
    </Button>
  );
}

export default AddStudentButton;
